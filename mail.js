const nodemailer = require("nodemailer");
const { CREDS, PATHS } = require("./constants");

const emailMBAzip = (name, email, transporter) => {
  const fileName = name.replace(" ", "_") + "_MBA_results.zip";
  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${email}`,
    subject: "MBA results",
    attachments: [
      {
        path: `${PATHS["repo"]}${fileName}`
      }
    ]
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
      pass: `${CREDS["email"]["password"]}`
    }
  });
};

module.exports = { emailMBAzip, openEmailConnection };
