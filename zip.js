const fs = require("fs");
const archiver = require("archiver");

const zipMBAresults = (name, email) => {
  const output = fs.createWriteStream(
    `${name.replace(" ", "_")}_MBA_results.zip`
  );

  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  archive.pipe(output);
  // hackerrank does not include the EXACT email address in the downloaded filename
  // instead, it replaces the '@' with a '_'
  const formattedEmail = email.replace("@", "_");
  archive.glob(`Report_MBA__*${formattedEmail}*.pdf`, {
    cwd: "/Users/andrewgregory/Downloads"
  });

  archive.finalize();
};

module.exports = zipMBAresults;
