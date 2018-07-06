const fs = require("fs");
const archiver = require("archiver");

const zipMBAresults = (name, email) => {
  const output = fs.createWriteStream(`${name}_MBA_results.zip`);

  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  archive.pipe(output);

  archive.glob(`Report_MBA__*${email}*.pdf`, {
    cwd: "/Users/andrewgregory/Downloads"
  });

  archive.finalize();
};

module.exports = zipMBAresults;
