const puppeteer = require("puppeteer");
const CREDS = require("./config/creds");
const STUDENTS = require("./config/students");
const PATHS = require("./config/paths");
const zipMBAresults = require("./zip");
const path = require("path");
const { openEmailConnection, emailMBAzip } = require("./mail");
const Platform = require("./platform");

class HackerRank extends Platform {
  sendEmails() {
    const transporter = openEmailConnection();
    for (let i = 0; i < STUDENTS.length; i++) {
      const { name, email } = STUDENTS[i];
      emailMBAzip(name, email, transporter);
    }
  }

  async downloadAllReports(email) {
    await this.searchStudent(email);
    await this.clickStudentRecord();
    const allHrefs = await this.findAllHrefs();
    for (let i = 0; i < allHrefs.length; i++) {
      const href = allHrefs[i];
      await this.page.goto(href);
      console.log(`Downloading report #${i + 1}...`);
      await this.clickDownloadBtn();
    }
  }

  async findAllHrefs() {
    await this.page.waitForSelector(".icon-keyboard");
    const allhrefs = await this.page.$$eval(".js-backbone", links =>
      links.reduce((hrefs, link) => {
        const isMBALink =
          link.innerText === "View Report" && !link.href.includes("interviews");
        if (isMBALink) hrefs.push(link.href);
        return hrefs;
      }, []),
    );
    return allhrefs;
  }

  async getScores() {
    const innerHTML = el => el.innerHTML;
    const allHrefs = await this.findAllHrefs();
    const MBAs = [];
    for (let i = 0; i < allHrefs.length; i++) {
      const href = allHrefs[i];
      await this.page.goto(href);
      await this.page.waitForSelector(".scored");
      const percentageScore = await this.page.$eval(".scored", innerHTML);
      const totalScore = await this.page.$eval(".max-score", innerHTML);
      const subjectSelector =
        "#report-tab-content-container > div > div > div.row.mjB > div.span-xs-8.span-md-10.no-padding._ar_hide_ > table > tbody > tr:nth-child(3) > td:nth-child(2) > strong";
      const subjectEl = await this.page.$eval(subjectSelector, innerHTML);
      if (subjectEl.innerHTML.includes("MBA")) {
        const subject = subjectEl.innerHTML.slice(5);
        const MBA = { percentageScore, totalScore, subject };
        MBAs.push(MBA);
      }
    }
    return MBAs;
  }
  async clickDownloadBtn() {
    await this.page.waitForSelector(".icon2-download");
    await this.page.evaluate(() =>
      document.querySelector(".icon2-download").click(),
    );
    await this.page.waitForSelector(".js-pdfprogress", { timeout: 0 });
    await this.page.waitForFunction(
      () =>
        document
          .querySelector(".js-pdfprogress")
          .innerHTML.includes("Your report is ready."),
      { timeout: 0 },
    );
    await this.page.waitFor(1500);
  }

  async clickStudentRecord() {
    await this.page.click(".candidate-row");
  }

  async searchStudent(email) {
    await this.page.goto(`https://www.hackerrank.com/x/search/${email}`);
    await this.page.waitForSelector(".candidate-row");
  }

  async login() {
    await this.page.goto("https://www.hackerrank.com/work/login");
    await this.page.click("#email");
    await this.page.keyboard.type(CREDS["HackerRank"]["username"]);

    await this.page.click("#password");
    await this.page.keyboard.type(CREDS["HackerRank"]["password"]);

    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click(".signupBtn"),
    ]);
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
