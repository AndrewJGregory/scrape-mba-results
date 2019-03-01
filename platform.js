const puppeteer = require("puppeteer");
const fs = require("fs");

class Platform {
  async startSession() {
    const browser = await puppeteer.launch({ headless: false, devTools: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000 });
    return { page, browser };
  }

  clearConsole() {
    process.stdout.write("\x1Bc");
  }

  writeToFile(obj, name) {
    const result = `STUDENTS = ${JSON.stringify(
      obj,
    )}; module.exports = STUDENTS;`;
    fs.writeFile(name, result, function(err) {
      if (err) console.log(err);
    });
  }

  async parseCsvToObj(filePath) {
    const students = await new Promise(resolve => {
      const result = [];
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;
        data
          .split("\n")
          .slice(1)
          .forEach(str => {
            let [name, careerCoach, email] = str.replace(/\"/g, "").split(",");
            careerCoach = careerCoach[0].toUpperCase();
            result.push({ name, email, careerCoach });
          });
        resolve(result);
      });
    });
    this.writeToFile(students, "./config/students.js");
  }
}

module.exports = Platform;
