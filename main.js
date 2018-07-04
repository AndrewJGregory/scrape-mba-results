const puppeteer = require("puppeteer");
const CREDS = require("./creds");

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  await searchStudent(page, "andrew gregory");
  await clickStudentRecord(page);
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
