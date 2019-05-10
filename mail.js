const nodemailer = require("nodemailer");
const { CREDS } = require("./config/creds");
const PATHS = require("./config/paths");
const ALL_COACHES = require("./config/creds");

const emailMBAscores = (student, transporter) => {
  const { email, name, MBAs } = student;

  MBAs.sort((mbaOne, mbaTwo) => {
    const scoreOne = parseFloat(mbaOne.percentageScore.slice(0, -1));
    const scoreTwo = parseFloat(mbaTwo.percentageScore.slice(0, -1));
    return scoreOne < scoreTwo ? 1 : -1;
  });

  let starterHTML = `
  <table style='text-align: center'>
  <thead>
  <tr>
  <th colspan='3'>MBA scores</th>
  </tr>
  </thead>
  <tbody style='text-align: center'>
  <tr>
  <td style='font-weight: 900'>Subject</td>
  <td style='font-weight: 900'>Total Score</td>
  <td style='font-weight: 900'>Percentage Score</td>
  </tr>
  `;

  let html = MBAs.reduce((html, MBA) => {
    const { percentageScore, totalScore, subject } = MBA;
    let row = "<tr>";
    const subjectCell = `<td>${subject}</td>`;
    const totalCell = `<td>${totalScore}</td>`;
    const percentageCell = `<td>${percentageScore}</td>`;
    row = row
      .concat(`${subjectCell}${totalCell}${percentageCell}`)
      .concat("</tr>");
    html = html.concat(row);
    return html;
  }, starterHTML);

  const endingHTML = "</tbody></table>";
  html = html.concat(endingHTML);

  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${email}, ${ALL_COACHES}`,
    subject: `MBA results for ${name}`,
    html,
  };

  return transporter.sendMail(mailOptions);
};

const emailMBAzip = async (name, email, transporter) => {
  const fileName = name.replace(" ", "_") + "_MBA_results.zip";
  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${email}, ${ALL_COACHES}`,
    subject: `MBA results for ${name}`,
    attachments: [
      {
        path: `${PATHS["repo"]}${fileName}`,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(name);
      }
    });
  }).then(
    name => console.log(`Finished sending email to ${name}`),
    err => console.log(err),
  );
};

const openEmailConnection = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${CREDS["email"]["address"]}`,
      pass: `${CREDS["email"]["password"]}`,
    },
  });
};

const sendReminderEmail = async (name, email, subjectsToDo, transporter) => {
  const startHTML = `Hello ${name.split(" ")[0]}. You have ${
    subjectsToDo.length
  } MBAs to finish. They are the following: `;
  let middleHTML = `<ul>`;
  subjectsToDo.forEach(subj => (middleHTML += `<li>${subj}</li>`));
  middleHTML += "</ul>";
  const endHTML = `If you have not completed them within one week, you will receive one strike. Once you have completed 
  these, please email career-coaches-ny@appacademy.io and we will send you 
  all of your results. Thank you.`;
  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${email}, ${ALL_COACHES}`,
    subject: `${subjectsToDo.length} MBAs Left To Do`,
    html: startHTML + middleHTML + endHTML,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(name);
      }
    });
  }).then(
    name => console.log(`Finished sending reminder email to ${name}`),
    err => console.log(err),
  );
};

module.exports = {
  emailMBAzip,
  openEmailConnection,
  emailMBAscores,
  sendReminderEmail,
};
