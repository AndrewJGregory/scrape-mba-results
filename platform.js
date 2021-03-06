const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const STUDENTS = require("./config/students");
const PATHS = require("./config/paths");
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
              const [name, email] = str.replace(/\"/g, "").split(",");
              result.push({ name, email });
            });
          resolve(result);
        }
      });
    }).then(
      async students =>
        await this.writeToFile(students, "./config/students.js"),
      err => console.log(err),
    );
  }

  async deleteMBAFiles() {
    const directory = `${PATHS["download"]}`;
    let count = 0;
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (err, fileNames) => {
        if (err) reject(err);
        for (const name of fileNames) {
          if (name.includes("Report_MBA__")) {
            count++;
            fs.unlink(path.resolve(directory, name), () =>
              console.log(`Deleted ${name}`),
            );
          }
        }
        resolve(count);
      });
    }).then(
      count => console.log(`deleted ${count} MBA files`),
      err => console.log(err),
    );
  }

  async countMBAFiles(email) {
    const newEmail = email.replace("@", "_");
    let count = 0;
    const directory = `${PATHS["download"]}`;
    return new Promise(resolve => {
      fs.readdir(directory, (err, fileNames) => {
        for (const name of fileNames) {
          if (name.includes(newEmail)) {
            count++;
          }
        }
        resolve(count);
      });
    });
  }
}

module.exports = Platform;
