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

  async writeToFile(obj, name) {
    const result = `STUDENTS = ${JSON.stringify(
      obj,
    )}; module.exports = STUDENTS;`;
    return new Promise((resolve, reject) => {
      fs.writeFile(name, result, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(
      () => console.log(`successfully wrote ${name}`),
      () => console.log(err),
    );
  }

  async updateFile(newStudent) {
    const idx = STUDENTS.findIndex(student => student.name === newStudent.name);
    STUDENTS[idx] = newStudent;
    await this.writeToFile(STUDENTS, "./config/students.js");
  }

  async parseCsvToObj(filePath) {
    return new Promise((resolve, reject) => {
      const result = [];
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          data
            .split("\n")
            .slice(1)
            .forEach(str => {
              let [name, careerCoach, email] = str
                .replace(/\"/g, "")
                .split(",");
              careerCoach = careerCoach
                ? careerCoach[0].toUpperCase()
                : "NO CAREER COACH";
              result.push({ name, email, careerCoach });
            });
          resolve(result);
        }
      });
    }).then(
      students => this.writeToFile(students, "./config/students.js"),
      err => console.log(err),
    );
  }
}

module.exports = Platform;
