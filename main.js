const puppeteer = require("puppeteer");
const CREDS = require("./creds");

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  await searchStudent(page, "brian liew");
  await clickStudentRecord(page);
  const allHrefs = await findAllHrefs(page);
  for (let i = 0; i < allHrefs.length; i++) {
    const href = allHrefs[i];
    await gotoReportPage(page, href);
    await clickDownloadBtn(page);
  }
}

async function findAllHrefs(page) {
  await page.waitForSelector(".icon-keyboard");
  const allhrefs = await page.$$eval(".js-backbone", links =>
    links.reduce((hrefs, link) => {
      if (link.innerText === "View Report") hrefs.push(link.href);
      return hrefs;
    }, [])
  );
  return allhrefs;
}

async function clickDownloadBtn(page) {
  await page.waitForSelector(".icon2-download");
  await page.click(".icon2-download");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
}

async function gotoReportPage(page, href) {
  await page.goto(`${href}`);
}

async function clickStudentRecord(page) {
  await page.click(".candidate-row");
}

async function searchStudent(page, name) {
  await page.click("#candidate-search-box-gl");
  await page.keyboard.type(name);
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
}

async function login(page) {
  await page.goto("https://www.hackerrank.com/work/login");
  await page.click("#email");
  await page.keyboard.type(CREDS.username);

  await page.click("#password");
  await page.keyboard.type(CREDS.password);

  await page.click(".signupBtn");

  await page.waitForNavigation();
}

main();
