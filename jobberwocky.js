const fs = require("fs");
const puppeteer = require("puppeteer");
const { CREDS, PATHS, STUDENTS } = require("./constants");
const Platform = require("./platform");

class Jobberwocky extends Platform {
  async login() {
    await this.page.goto("https://progress.appacademy.io/instructors/sign_in");
    await this.page.click("#instructor_email");
    await this.page.keyboard.type(CREDS["jobberWocky"]["email"]);

    await this.page.click("#instructor_password");
    await this.page.keyboard.type(CREDS["jobberWocky"]["password"]);

    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click("button"),
    ]);
  }

  async writeIds() {
    let id;
    await this.page.goto("https://progress.appacademy.io/jobberwocky");
    for (let i = 0; i < STUDENTS.length; i++) {
      await this.page.click("input[placeholder]");
      await this.page.keyboard.type(STUDENTS[i]["name"], { delay: 100 });
      /* delay is necessary here because of the specific way that
       the input field works on jobberwocky: it auto-suggests names
       as one types, if the name is typed instantly with no delay then
       the wrong name is selected more often than not. A delay makes
       the typing more human-like */
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "networkidle0" }),
        this.page.keyboard.press("Enter"),
      ]);
      id = this.page.url().match(/\d+/)[0];
      console.log(`NAME: ${STUDENTS[i]["name"]}, ID: ${id}`);
      STUDENTS[i]["id"] = id;
    }
  }

  async writeEmails() {
    let email;
    const emailCSSselector =
      "body > main > section > section > section > article.contact-info.block > table > tbody > tr:nth-child(4) > td:nth-child(2) > a";
    await this.page.goto("https://progress.appacademy.io/");
    for (let i = 0; i < STUDENTS.length; i++) {
      await Promise.all([
        this.page.goto(
          `https://progress.appacademy.io/students/${STUDENTS[i]["id"]}`,
        ),
        this.page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);
      email = await this.page.$eval(emailCSSselector, link => link.innerHTML);
      console.log(`name: ${STUDENTS[i]["name"]}, email: ${email}`);
      STUDENTS[i]["email"] = email;
    }
  }
}

module.exports = Jobberwocky;
