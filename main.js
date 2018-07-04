const puppeteer = require("puppeteer");
const CREDS = require("./creds");

async function login() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await page.goto("https://www.hackerrank.com/work/login");
  await page.click("#email");
  await page.keyboard.type(CREDS.username);

  await page.click("#password");
  await page.keyboard.type(CREDS.password);

  await page.click(".signupBtn");

  await page.waitForNavigation();
}

login();
