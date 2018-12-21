const nodemailer = require("nodemailer");
const { CREDS, PATHS } = require("./constants");

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
    to: `${email}, agregory@appacademy.io, dcatalano@appacademy.io, jfehrman@appacademy.io`,
    subject: `MBA results for ${name}`,
    html,
  };

  return transporter.sendMail(mailOptions);
};

const emailMBAzip = (name, email, transporter) => {
  const fileName = name.replace(" ", "_") + "_MBA_results.zip";
  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${email}, agregory@appacademy.io, dcatalano@appacademy.io, jfehrman@appacademy.io`,
    subject: "MBA results",
    attachments: [
      {
        path: `${PATHS["repo"]}${fileName}`,
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(`Finished sending email to ${name}...`);
  });
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

module.exports = { emailMBAzip, openEmailConnection, emailMBAscores };
