## Introduction

Our students take thirteen Market Based Assessments (MBAs) through HackerRank that test them on knowledge that the tech market requires. After they complete these, we (career coaches at [App Academy](https://www.appacademy.io/)) have to email out the detailed results of these assessments so they can review them and use them as a tool for studying. This process of downloading thirteen reports for each student, compressing them into a single file, and emailing them has been **extremely** tedious and a massive drain on time. To help with this, I automated the entire process: downloading each and every report for each student, compressing, emailing, and deleting the files at the very end.

### Technologies

- [puppeteer](https://github.com/GoogleChrome/puppeteer/), a headless Chrome node API to automate Chrome
- [archiver](https://github.com/archiverjs/node-archiver), to compress multiple files into one zipped archive
- [nodemailer](https://github.com/nodemailer/nodemailer), to automatically send the final email to each student with the appropriate attached .zip file

### Previous Workflow

1. Search for student
2. Click the correct student to display all reports
3. For each MBA test, click "View Report" which redirects to a new page, then click the download button.
4. Go back to all reports page, repeat step 3.
5. Repeat for a new student.

Using myself as an example, this is what the above workflow looks like for only **three** reports instead of all thirteen: (click to play)

<a href="http://www.youtube.com/watch?feature=player_embedded&v=3A_IvwM7e1Y
" target="_blank"><img src="http://img.youtube.com/vi/3A_IvwM7e1Y/0.jpg"
alt="IMAGE ALT TEXT HERE" width="240" height="180"></a>

Very boring! There must be a better way...

### General Initial Approaches

First, I looked into the HackerRank for Work API. While [they do have an API](https://www.hackerrank.com/work/apidocs#!/Tests/options_tests) it returns only ugly JSON instead of a beautiful and descriptive PDF that is generated from manually clicking the download button.

Second, I tried making a Chrome extension that would automate this task using jQuery but I ran into several seemingly insurmountable roadblocks. The furthest I did get was having the report automatically download when the "View Report" link is clicked open in another tab. I tried extrapolating this logic to the following:

1. Grab all "View Report" links (this logic is critical in the final result)
2. Open all of them in new tabs
3. Let the Chrome extension download all of the reports in the background.

[Opening all of the links in another tab](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) is fairly easy, but for some reason I could not figure out why only _some_ of the reports would download, not all of them. There seemed to be no pattern to this, or not one that I could deduce anyway. After a few hours of hair pulling, I knew that there had to be another way.

Third, I started thinking what is exactly I am trying to do. In a way, I'm trying to "scrape" a website for data. So I googled around for scraping tools and came across [selenium](https://github.com/SeleniumHQ/selenium). I tried using it but it seemed like overkill for what I wanted to accomplish. Eventually I came across [puppeteer](https://github.com/GoogleChrome/puppeteer/) and everything started to finally come together.

### Thought Process

As for automating everything, everything was done in very incremental steps. This allows for rapid progress. Here are the steps that I followed to complete this project:

1. Search for one student, click appropriate result
2. Download one report for one student
3. Download all reports for one student
4. Download all reports for all students
5. Zip all thirteen MBA results for one student
6. Zip all MBA results for all students
7. Email one student their zipped MBA results
8. Email all students their results

This "one then all" approach is extremely efficient and allows for testing in small chunks.

### Current Workflow

#### Setup:

First, create a folder named `config` and make two files in it named `creds.js` and `paths.js` following the structure below. There will be a `students.js` file however this will be created by parsing a CSV file obtained from Salesforce.

```javascript
// creds.js
const CREDS = {
  HackerRank: { username: "xxx", password: "xxx" },
  email: { address: "xxx", password: "xxx" },
};

module.exports = CREDS;

// paths.js
const PATHS = {
  download: "/Users/andrewgregory/Downloads",
  repo: "/Users/andrewgregory/Desktop/repos/scrape-mba-results/",
};

module.exports = PATHS;

// students.js

const STUDENTS = [
  {
    name: "Andrew Gregory",
    email: "AndrewJGregoryAJG@gmail.com",
    careerCoach: "A",
  },
];

module.exports = STUDENTS;
```

Second, to allow `nodemailer` to automatically send email from your email address, log into your gmail account and go to its settings. Sign-in & security => Apps with account access => check "Allow less secure apps".

Third, be sure to have node installed and `npm i nodemailer puppeteer archiver` in the repo directory.

Then `cd` into the repo directory and run `node main.js`.

#### Execution:

For the same three reports, the workflow now looks like this:

<a href="http://www.youtube.com/watch?feature=player_embedded&v=06ElqxY4w6U
" target="_blank"><img src="http://img.youtube.com/vi/06ElqxY4w6U/0.jpg"
alt="IMAGE ALT TEXT HERE" width="240" height="180"></a>

The most important part about this is that after setup and running the file, everything else is hands off. This can entirely operate in the background as we complete other tasks or as we have lunch.

### Cool code snippet

After a student's search result is clicked, a page comes up listing out all of the MBAs with a link of "View Report". This search result page is only visited once, and all of the links of "View Report" are grabbed to store the associated `href`s of all of them. The general approach was noticing some sort of similarity between all of the "View Report" links. I noticed that they all had the same class, `.js-backbone`. This is not specific enough to select from because there are around 60 elements on the page with this class. What the links did have in common was their `innerText`, which is "View Report". Armed with this knowledge, executing the following gives an array of all `href` links:

```js
  async findAllHrefs() {
    await this.page.waitForSelector(".icon-keyboard");
    const allhrefs = await this.page.$$eval(".js-backbone", links =>
      links.reduce((hrefs, link) => {
        const isMBALink =
          link.innerText === "View Report" && !link.href.includes("interviews");
        if (isMBALink) hrefs.push(link.href);
        return hrefs;
      }, []),
    );
    return allhrefs;
  }
```

Here, `page` is an object of puppeteer. `.$$eval` is equivalent to `Array.from(document.getElementsByClassName('js-backbone'))`, which is returned as a parameter in the second argument of `.$$eval`. Reducing this array (filtering then mapping would be equivalent yet longer) gives all the URLs we need.

These URLs are used because they are iterated through, wait for the page to load, then click the download button.
