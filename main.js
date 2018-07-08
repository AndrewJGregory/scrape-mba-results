const puppeteer = require("puppeteer");
const CREDS = require("./creds");
const zipMBAresults = require("./zip");
const path = require("path");
const fs = require("fs");
const mail = require("./mail.js");
const PATHS = require("./PATHS");

async function main() {
  const STUDENTS = [{ name: "", email: "" }];
  let browser, page;
  clearConsole();
  for (let i = 0; i < STUDENTS.length; i++) {
    ({ browser, page } = await startSession());
    const { name, email } = STUDENTS[i];
    console.log(`Starting ${name}, student #${i + 1}:\n`);
    await downloadAllReports(page, email);
    console.log(`\nFinished downloading for ${name}.\n`);
    zipMBAresults(name, email);
    await browser.close();
  }
  sendEmails(STUDENTS);
  setInterval(deleteMBAFiles, 600000);
}

function sendEmails(STUDENTS) {
  const transporter = mail.openEmailConnection();
  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, email } = STUDENTS[i];
    mail.emailMBAzip(name, email, transporter);
  }
}

function clearConsole() {
  process.stdout.write("\033c");
}

async function startSession() {
  let browser = await puppeteer.launch({ headless: false, devTools: true });
  let page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  return { browser, page };
}

async function downloadAllReports(page, email) {
  await searchStudent(page, email);
  await clickStudentRecord(page);
  const allHrefs = await findAllHrefs(page);
  for (let i = 0; i < allHrefs.length; i++) {
    const href = allHrefs[i];
    await gotoReportPage(page, href);
    console.log(`Downloading report #${i + 1}...`);
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
  await page.waitFor(10000);
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

  await Promise.all([page.waitForNavigation(), page.click(".signupBtn")]);
  await page.waitFor(5000);
  await page
    .click(".aurycModalCloseButton")
    .catch(() => console.log("no modal found"));
}

function deleteMBAFiles() {
  const directory = `${PATHS["download"]}`;
  fs.readdir(directory, (err, fileNames) => {
    for (const name of fileNames) {
      const shouldDelete = name.includes("Report_MBA__");
      if (shouldDelete) {
        fs.unlink(path.resolve(directory, name), () =>
          console.log(`Deleted ${name}`)
        );
      }
    }
  });
}

main();
