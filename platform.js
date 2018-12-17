const puppeteer = require("puppeteer");

class Platform {
  async startSession() {
    const browser = await puppeteer.launch({ headless: false, devTools: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000 });
    this.page = page;
    this.browser = browser;
  }

  clearConsole() {
    process.stdout.write("\x1Bc");
  }

  writeToFile(obj) {
    fs.writeFile("./writtenFile.js", JSON.stringify(obj), function(err) {
      if (err) console.log(err);
    });
  }
}

module.exports = Platform;
