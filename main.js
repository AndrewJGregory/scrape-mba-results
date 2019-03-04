const HackerRank = require("./hackerrank");
const Platform = require("./platform");
const STUDENTS = require("./config/students");
const { openEmailConnection, emailMBAscores } = require("./mail");

const main = async () => {
  const platform = new Platform();
  platform.clearConsole();
  const { browser, page } = await platform.startSession();
  const hackerRank = new HackerRank();
  hackerRank.page = page;
  await hackerRank.login();
  await browser.close();
};

const sendScores = async hackerRank => {
  const transporter = openEmailConnection();
  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, email } = STUDENTS[i];
    await hackerRank.searchStudent(email);
    await hackerRank.clickStudentRecord();
    const MBAs = await hackerRank.getScores();
    const student = { name, email, MBAs };
    await emailMBAscores(student, transporter);
    console.log(`sent email to ${name}`);
  }
};

main();
