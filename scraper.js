import axios from 'axios';
import fs from 'fs/promises';
import cheerio from 'cheerio';
import { URL } from 'url';

const fetchLimit = 100000; // Adjust based on your needs
const concurrencyLimit = 40; // Defines how many URLs to process in parallel
const errorDomains = new Set(); // Tracks domains with encountered errors to avoid further processing
const uniqueEmails = new Set(); // Stores unique emails to prevent duplicates

async function loadUrls(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent.split('\n').filter(line => line.trim() !== '').slice(0, fetchLimit);
    } catch (error) {
        console.error(`Failed to read URLs from ${filePath}: ${error.message}`);
        return [];
    }
}

async function fetchPage(url) {
    try {
        const response = await axios.get(url, { timeout: 20000 }); // Sets a 10-second timeout for each request
        return response;
    } catch (error) {
        console.error(`Failed to fetch ${url}: ${error.code} - ${error.message}`);
        const domain = new URL(url).hostname;
        errorDomains.add(domain); // Ceases further attempts for this domain on any encountered error
        throw new Error(`Halting further requests to ${domain} due to encountered error.`);
    }
}

async function fetchAndProcessPage(url, currentDepth = 1) {
    const domain = new URL(url).hostname;

    if (errorDomains.has(domain)) {
        console.log(`Skipping ${url} due to previous errors in domain.`);
        return;
    }

    try {
        const response = await fetchPage(url);
        const content = response.data;
        const $ = cheerio.load(content);

        // Extracts emails, excluding specified domains and filtering out media content
        const emails = (content.match(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g) || [])
            .filter(email => !email.match(/\.(png|jpg|gif|pdf)$/i))
            .filter(email => !email.endsWith('@example.com') && !email.endsWith('@mail.com') && !email.endsWith('@website.com'));

        emails.forEach(email => {
            if (!uniqueEmails.has(email)) {
                uniqueEmails.add(email); // Adds new unique emails
                console.log(email); // Logs each new email to the console
            }
        });

        // Continues to follow links only if no email was found on the current page and within depth limit
        if (emails.length === 0 && currentDepth < 2) {
            const promises = $('a')
                .map((_, element) => $(element).attr('href'))
                .get()
                .filter(href => href && !href.startsWith('mailto:') && !href.match(/\.(png|jpg|gif|pdf|#)$/i))
                .map(href => {
                    const nextUrl = new URL(href, url).href;
                    return new URL(nextUrl).hostname === domain ? fetchAndProcessPage(nextUrl, currentDepth + 1) : null;
                })
                .filter(promise => promise !== null);
                
            await Promise.allSettled(promises); // Processes all found links in parallel
        }
    } catch {
        // Errors within fetchAndProcessPage are logged via fetchPage
    }
}

async function processInBatches(urls, batchSize) {
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(url => fetchAndProcessPage(url).catch(() => {})));
    }
}

async function saveEmails() {
    try {
        await fs.writeFile('emails.txt', Array.from(uniqueEmails).join('\n'));
        console.log('Email collection saved to emails.txt');
    } catch (error) {
        console.error(`Failed to save emails: ${error.message}`);
    }
}

function setupShutdownHooks() {
    const shutdownHandler = async (signal) => {
        console.log(`Received ${signal}. Saving emails and exiting...`);
        await saveEmails();
        process.exit(0);
    };

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
}

async function main() {
    setupShutdownHooks();
    const urls = await loadUrls('list.txt');
    await processInBatches(urls, concurrencyLimit);
    await saveEmails(); // Save emails when processing completes normally
}

main();
