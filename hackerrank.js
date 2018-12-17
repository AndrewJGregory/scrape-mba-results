const puppeteer = require("puppeteer");
const { CREDS, PATHS, STUDENTS } = require("./constants");
const zipMBAresults = require("./zip");
const path = require("path");
const { openEmailConnection, emailMBAzip } = require("./mail");
const Platform = require("./platform");

class HackerRank extends Platform {
  async main() {
    this.clearConsole();
    const { browser, page } = await this.startSession();
    await login(page);
    for (let i = 0; i < STUDENTS.length; i++) {
      const { name, email } = STUDENTS[i];
      console.log(`Starting ${name}, student #${i + 1}:\n`);
      await this.downloadAllReports(page, email);
      console.log(`\nFinished downloading for ${name}.\n`);
      this.zipMBAresults(name, email);
      await browser.close();
    }
  }

  sendEmails() {
    const transporter = openEmailConnection();
    for (let i = 0; i < STUDENTS.length; i++) {
      const { name, email } = STUDENTS[i];
      emailMBAzip(name, email, transporter);
    }
  }

  async downloadAllReports(page, email) {
    await searchStudent(page, email);
    await clickStudentRecord(page);
    const allHrefs = await findAllHrefs(page);
    for (let i = 0; i < allHrefs.length; i++) {
      const href = allHrefs[i];
      await page.goto(href);
      console.log(`Downloading report #${i + 1}...`);
      await clickDownloadBtn(page);
    }
  }

  async findAllHrefs(page) {
    await page.waitForSelector(".icon-keyboard");
    const allhrefs = await page.$$eval(".js-backbone", links =>
      links.reduce((hrefs, link) => {
        if (
          link.innerText === "View Report" &&
          !link.href.includes("interviews")
        )
          hrefs.push(link.href);
        return hrefs;
      }, []),
    );
    return allhrefs;
  }

  async clickDownloadBtn(page) {
    await page.waitForSelector(".icon2-download");
    await page.evaluate(() =>
      document.querySelector(".icon2-download").click(),
    );
    await page.waitForSelector(".js-pdfprogress", { timeout: 0 });
    await page.waitForFunction(
      () =>
        document
          .querySelector(".js-pdfprogress")
          .innerHTML.includes("Your report is ready."),
      { timeout: 0 },
    );
    await page.waitFor(1500);
  }

  async clickStudentRecord(page) {
    // hangs here
    await page.waitForSelector(".candidate-row");
    await page.click(".candidate-row");
  }

  async searchStudent(page, email) {
    await page.waitForSelector("#candidate-search-box-gl");
    await page.click("#candidate-search-box-gl");
    await page.keyboard.type(email);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  }

  async login(page) {
    await page.goto("https://www.hackerrank.com/work/login");
    await page.click("#email");
    await page.keyboard.type(CREDS["HackerRank"]["username"]);

    await page.click("#password");
    await page.keyboard.type(CREDS["HackerRank"]["password"]);

    await Promise.all([page.waitForNavigation(), page.click(".signupBtn")]);
    await page
      .click(".aurycModalCloseButton")
      .catch(() => console.log("no modal found"));
  }

  deleteMBAFiles() {
    const directory = `${PATHS["download"]}`;
    fs.readdir(directory, (err, fileNames) => {
      for (const name of fileNames) {
        const shouldDelete = name.includes("Report_MBA__");
        if (shouldDelete) {
          fs.unlink(path.resolve(directory, name), () =>
            console.log(`Deleted ${name}`),
          );
        }
      }
    });
  }
}

module.exports = HackerRank;
