/*
Name: SKelly
Date Completed: 06.04.2024

Description: This script can be used to get the top 10 electronic products from Amazon's Bestsellers list, and then export that data to a CSV file.

Packages Used: 
csv-writer: https://www.npmjs.com/package/csv-writer
playwright: https://www.npmjs.com/package/playwright
*/

const { chromium } = require("playwright");
// create a csv writer object
const csvWrite = require('csv-writer').createObjectCsvWriter;

// function that takes in a min, and max value, and then calculates a random wait time using these values
function randDelay(min,max){
  const wait = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, wait));
}

async function saveAmazonPosts() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  // open a new instance of the chromium browser
  const page = await context.newPage();

  // wait a random amount of time between 1.5 and 4 seconds
  await randDelay(1500, 4000);
  // go to Amazon Bestsellers > Electronics Page
  await page.goto("https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics/ref=zg_bs_nav_electronics_0");
  //wait for page to fully load the selectors
  await page.waitForSelector('.p13n-sc-uncoverable-faceout')
  // get the top 10 electronic products, and then save the titles and URLs to a CSV file
  const products = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.p13n-sc-uncoverable-faceout'));
    return links.slice(0,10).map(link => {
      const pageTitle = link.querySelector('._cDEzb_p13n-sc-css-line-clamp-3_g3dy1');
      const pageURL = link.querySelector('.a-link-normal');
      return {
        // return the title and url of the product, else, return the string 'Title Not Found' and 'URL Not Found'
        title: pageTitle ? pageTitle.textContent.trim() : 'Title Not Found',
        url: pageURL ? pageURL.href : 'URL Not Found'
      };
    });
  });
  
  // create the csv file name and header
  const csvData = csvWrite({
    path: 'top10AmazonProducts.csv',
    header: 
    [
      {id: 'title', title: 'pageTitle'},
      {id: 'url', title: 'pageURL'}
    ]
  });

  // call the csv writer function to write the data to the './top10AmazonProducts.csv' file
  await csvData.writeRecords(products);
  // close the browser connection
  await browser.close();
}

// call the saveAmazonPosts() function
(async () => {
  await saveAmazonPosts();
})();
