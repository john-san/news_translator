// for VN Express
import puppeteer from "puppeteer";
import readline from "readline";
import getVocab from "./getVocab";
import getEasySentences from "./getEasySentences";
import { parseDate } from "./utils";
import writeToCsv from "./writeToCsv";

const scrape = async (): Promise<any> => {
  try {
    let accepted = false;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let result: any = {};
    // await page.goto(url)

    while (accepted == false) {
      await page.goto("https://vnexpress.net");
      await page.waitForSelector("nav.main-nav");

      const topics = await page.evaluate(() => {
        const topicLinks = Array.from(
          document.querySelectorAll("nav.main-nav > ul.parent > li > a")
        );
        return topicLinks.map((link, index) => {
          const anchor = link as HTMLAnchorElement;
          return {
            index: index + 1,
            name: anchor.textContent!.trim(),
            href: anchor.href,
          };
        });
      });

      console.log("Pick a topic:");
      topics.forEach((topic) => {
        console.log(`${topic.index}. ${topic.name}`);
      });

      const topicIndex = await new Promise<number>((resolve) => {
        rl.question(
          "Enter the number of the topic you want to explore: ",
          (topicIndex) => {
            resolve(parseInt(topicIndex, 10));
          }
        );
      });

      const selectedTopic = topics.find((topic) => topic.index === topicIndex);
      if (!selectedTopic) {
        console.log("Invalid topic number. Exiting...");
        rl.close();
        await browser.close();
        return;
      }

      console.log(`You selected "${selectedTopic.name}".`);

      await page.goto(selectedTopic.href);
      await page.waitForSelector("ul.ul-nav-folder");

      const subtopics = await page.evaluate(() => {
        const subtopicLinks = Array.from(
          document.querySelectorAll("ul.ul-nav-folder > li a")
        );
        return subtopicLinks.map((link, index) => {
          const anchor = link as HTMLAnchorElement;
          return {
            index: index + 1,
            name: anchor.textContent!.trim(),
            href: anchor.href,
          };
        });
      });

      console.log("Pick a subtopic:");
      subtopics.forEach((subtopic) => {
        console.log(`${subtopic.index}. ${subtopic.name}`);
      });

      const subtopicIndex = await new Promise<number>((resolve) => {
        rl.question(
          "Enter the number of the subtopic you want to explore: ",
          (subtopicIndex) => {
            resolve(parseInt(subtopicIndex, 10));
          }
        );
      });

      const selectedSubtopic = subtopics.find(
        (subtopic) => subtopic.index === subtopicIndex
      );
      if (!selectedSubtopic) {
        console.log("Invalid subtopic number. Exiting...");
        rl.close();
        await browser.close();
        return;
      }

      console.log(`You selected "${selectedSubtopic.name}".`);

      await page.goto(selectedSubtopic.href);

      await page.waitForSelector(".article-topstory");
      await page.click(".article-topstory");
      await page.waitForSelector(".title-detail");
      await page.waitForSelector(".fck_detail");
      await page.waitForSelector(".date");
      result = await page.evaluate(() => {
        let url = document.location.href;
        let title = document
          .querySelector(".title-detail")
          ?.textContent?.trim();
        let content = document
          .querySelector(".fck_detail")
          ?.textContent?.trim();
        let date = document.querySelector(".date")?.textContent;
        // remove newlines and tabs from content
        content = content?.replace(/\n|\t/g, "");

        return {
          url,
          title,
          content,
          date,
        };
      });

      console.log("result:", result);
      console.log("Do you want to study this article? (y/n)");
      const answer = await new Promise<string>((resolve) => {
        rl.question("Enter your answer: ", (answer) => {
          resolve(answer);
        });
      });
      if (answer === "y") {
        console.log("Using the current article.");
        accepted = true;
      }
    }

    browser.close();
    rl.close();

    return result;
  } catch (error) {
    console.log(error);
  }
};

async function scrapeAndProcess() {
  const result = await scrape();
  result.date = parseDate(result?.date);

  console.log(result);

  result.vocab = await getVocab(result.content);
  console.log(result.vocab);

  result.sentences = await getEasySentences(result.content);
  console.log(result.sentences);

  await writeToCsv(result);
}

/* TODO:
- find way to automatically import files to anki
- fix issue with npm start
*/

scrapeAndProcess();
