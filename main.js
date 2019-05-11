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
  const unfinishedStudents = [];
  await platform.deleteMBAFiles();
  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, email } = STUDENTS[i];
    // const finishedSubjects = await hackerRank.findFinishedSubjects(STUDENTS[i]);
    // const subjectsToDo = ALL_SUBJECTS.filter(
    //   subj => !finishedSubjects.includes(subj),
    // );
    // if (subjectsToDo.length > 0) {
    // console.log(name + " has " + subjectsToDo.length + " left");
    // await sendReminderEmail(name, email, subjectsToDo, transporter);
    // } else {
    try {
      console.log(`Starting ${name}...`);
      await hackerRank.downloadAllReports(STUDENTS[i]);
      const reportCount = await hackerRank.countMBAFiles(email);
      if (reportCount > 0) {
        console.log(
          `Finished ${++hackerRank.finishedStudents} students out of ${
            STUDENTS.length
          }`,
        );
        await zipMBAresults(name, email);
        await emailMBAzip(name, email, transporter);
      } else {
        console.log(`${name} has 0 MBAs.`);
        unfinishedStudents.push({ name, email });
        hackerRank.finishedStudents++;
      }
    } catch (e) {
      hackerRank.finishedStudents++;
      console.log(e);
    }
    // }
  }
  console.log(unfinishedStudents);
  await platform.deleteMBAFiles();
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
