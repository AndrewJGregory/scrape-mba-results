const HackerRank = require("./hackerrank");
const Platform = require("./platform");
const STUDENTS = require("./config/students");
const {
  openEmailConnection,
  emailMBAzip,
  sendReminderEmail,
} = require("./mail");
const zipMBAresults = require("./zip");

const ALL_SUBJECTS = [
  "JavaScript",
  "React/Redux",
  "General Computer Science",
  "Coding Questions",
  "Algorithms",
  "Data Types/Structures",
  "Rails/ActiveRecord",
  "Security",
  "Front End/Vanilla DOM manipulation",
  "Object Oriented Programming",
  "Databases",
  "Ruby",
  "Intermediate Programming Concepts",
];

const main = async () => {
  const platform = new Platform();
  platform.clearConsole();
  const { browser, page } = await platform.startSession();
  const hackerRank = new HackerRank(page);
  await hackerRank.login();
  const transporter = openEmailConnection();
  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, email } = STUDENTS[i];
    const finishedSubjects = await hackerRank.findFinishedSubjects(STUDENTS[i]);
    const subjectsToDo = ALL_SUBJECTS.filter(
      subj => !finishedSubjects.includes(subj),
    );
    if (subjectsToDo.length > 0) {
      await sendReminderEmail(name, email, subjectsToDo, transporter);
    } else {
      await hackerRank.downloadAllReports(STUDENTS[i]);
      await zipMBAresults(name, email);
      await emailMBAzip(name, email, transporter);
    }
  }
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
