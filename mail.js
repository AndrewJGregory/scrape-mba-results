const nodemailer = require("nodemailer");
const CREDS = require("./CREDS");

const emailMBAzip = (name, email, transporter) => {
  const fileName = name.replace(" ", "_") + "_MBA_results.zip";
  const mailOptions = {
    from: `${CREDS["email"]}`,
    to: `${email}`,
    subject: "MBA results",
    attachments: [
      {
        path: `/Users/andrewgregory/Desktop/repos/scrape-mba-results/${fileName}`
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
      user: `${CREDS["email"]}`,
      pass: `${CREDS["email_password"]}`
    }
  });
};

module.exports = { emailMBAzip, openEmailConnection };
