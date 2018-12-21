const HackerRank = require("./hackerrank");
const JobberWocky = require("./jobberwocky");
const Platform = require("./platform");
const { STUDENTS } = require("./constants");
const { openEmailConnection, emailMBAscores } = require("./mail");

const main = async () => {
  const platform = new Platform();
  platform.clearConsole();
  const { browser, page } = await platform.startSession();
  const jobberWocky = new JobberWocky();
  const hackerRank = new HackerRank();
  jobberWocky.page = page;
  hackerRank.page = page;
  await hackerRank.login();
  await browser.close();
};

const writeStudentInfo = async (jobberWocky, platform) => {
  const newStudents = STUDENTS.slice();
  await jobberWocky.login();
  await jobberWocky.writeIds(newStudents);
  await jobberWocky.writeEmails(newStudents);
  platform.writeToFile(newStudents);
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
