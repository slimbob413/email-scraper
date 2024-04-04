# Email Scraper

## Overview
Email Scraper is a Node.js tool designed for efficient and responsible email extraction from a list of URLs. It leverages parallel processing, smart timeout management, and robust error handling to ensure fast and reliable data collection, with an automatic save feature for data integrity during unexpected script interruptions.

## Features
- **Parallel URL Processing**: Handles multiple URLs concurrently to optimize scraping speed.
- **Timeout Management**: Implements request timeouts to avoid hang-ups on slow responses.
- **Error Handling**: Smartly skips problematic domains upon encountering errors, ensuring the smooth continuation of the scraping process.
- **Automatic Data Preservation**: Automatically saves collected emails to a file, safeguarding against data loss from script interruptions.
- **Filtering and Deduplication**: Filters out unwanted email domains and ensures email uniqueness.

## Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/<your-username>/email-scraper.git
    cd email-scraper
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

## Usage

1. **Prepare URL List**: Create a `list.txt` file in the project root with one URL per line.

2. **Run the Scraper**
    ```bash
    node scraper.js
    ```

## Configuration

- **Fetch Limit**: Adjust `fetchLimit` in `scraper.js` to set the maximum number of URLs to process.
- **Concurrency Limit**: Modify `concurrencyLimit` to control the number of parallel requests. Consider the target server's capacity to avoid overwhelming it.

## Saving Results

Collected emails are automatically saved to `emails.txt` in the project root directory. The scraper ensures that each email is unique and filters out predefined unwanted domains.

## Contribution

Contributions to enhance `Email Scraper` are welcome. Feel free to fork the repository, make your improvements, and submit a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Disclaimer

Use `Email Scraper` responsibly and ethically. Adhere to website terms of service and privacy policies. The developer assumes no liability for misuse or any legal repercussions that may arise from its use.
