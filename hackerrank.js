const { CREDS } = require("./config/creds");
const Platform = require("./platform");

class HackerRank extends Platform {
  constructor(page) {
    super();
    this.page = page;
    this.finishedStudents = 0;
  }

  async downloadAllReports(student) {
    await this.search(student);
    await this.clickStudentRecord();
    const allHrefs = await this.findAllHrefs();
    for (let i = 0; i < allHrefs.length; i++) {
      const href = allHrefs[i];
      await this.page.goto(href);
      console.log(`Downloading report #${i + 1}...`);
      await this.clickDownloadBtn();
    }
  }

  async findFinishedSubjects(student) {
    await this.search(student);
    await this.clickStudentRecord();
    await this.page.waitForSelector(".icon-keyboard");
    const result = await this.page.$$eval(".pull-left.content_box", els =>
      els
        .filter(el => el.innerText.includes("Attempted"))
        .map(el => el.children[0].innerText.slice(5)),
    );
    return result;
  }

  async findAllHrefs() {
    await this.page.waitForSelector(".icon-keyboard");
    const allhrefs = await this.page.$$eval(".pull-left.content_box", links =>
      links
        .map(link => [...link.querySelectorAll("a")])
        .filter(arr => arr.length === 2 && arr[0].innerText.includes("MBA: "))
        .map(arr => arr[1].href),
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

  async search(student) {
    try {
      await this.page.goto(
        `https://www.hackerrank.com/x/search/${student.email}`,
      );
      await this.page.waitForSelector(".candidate-row", { timeout: 5000 });
    } catch (e) {
      await this.page.$eval("#candidate-search-box-gl", el => (el.value = ""));
      await this.page.click("#candidate-search-box-gl");
      await this.page.keyboard.type(student.name);
      await this.page.keyboard.press("Enter");
      await this.page.waitForSelector(".candidate-row");
      const correctEmail = await this.page.$eval(
        ".candidate-row",
        row => row.children[1].innerText,
      );
      student.email = correctEmail;
      await this.updateFile(student);
    }
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
}

module.exports = HackerRank;
