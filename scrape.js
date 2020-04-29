const fs = require('fs');
const puppeteer = require('puppeteer');
const xlsx = require("xlsx");

function csvToExcel(inputs) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(inputs);
    xlsx.utils.book_append_sheet(wb, ws, "sheet");
    xlsx.writeFile(wb, "sample.xlsx");
}



function extractItems() {
  const extractedElements = document.querySelectorAll('#boxes > div.box');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.innerText);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch(e) { }
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto('https://intoli.com/blog/scrape-infinite-scroll/demo.html');

  // Scroll and extract items from the page.
  var items =[ await scrapeInfiniteScrollItems(page, extractItems, 1)];

  // Save extracted items to a file.
 csvToExcel(items);
//console.log(items);
  // Close the browser.
  await browser.close();
})();