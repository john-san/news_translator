// for VN Express
import puppeteer from "puppeteer";
import getVocab from "./getVocab";
import getEasySentences from "./getEasySentences";
import { translateString } from "./translateSentences";
import { parseDate, promptForInput } from "./utils";
import writeToCsv from "./writeToCsv";

const scrape = async (): Promise<any> => {
  try {
    let accepted = false;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let result: any = {};

    while (accepted == false) {
      await page.goto("https://vnexpress.net");

      /* Select Topic */

      await page.waitForSelector("nav.main-nav > ul.parent > li > a");

      const topics = await page.evaluate(() => {
        const excludedTopics = [
          "",
          "Video",
          "Podcasts",
          "Mới nhất",
          "Thư giãn",
          "Tâm sự",
          "Tất cả",
        ];
        const topicLinks = Array.from(
          document.querySelectorAll("nav.main-nav > ul.parent > li > a")
        ).filter((link) => {
          const anchor = link as HTMLAnchorElement;
          return !excludedTopics.includes(anchor.textContent!.trim());
        });

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
      // for..of loop to iterate sequentially
      for (const topic of topics) {
        console.log(
          `${topic.index}. ${topic.name} (${await translateString(topic.name)})`
        );
      }

      const selectedTopicIndex = await promptForInput(
        "Enter the number of the topic you want to explore: ",
        (input) => {
          const index = parseInt(input, 10);
          const selectedTopic = topics.find((topic) => topic.index === index);
          return selectedTopic ? index : undefined;
        }
      );

      const selectedTopic = topics.find(
        (topic) => topic.index === selectedTopicIndex
      );

      console.log(`You selected "${selectedTopic!.name}".`);

      await page.goto(selectedTopic!.href);

      /* Select Subtopic */

      await page.waitForSelector("ul.ul-nav-folder > li a");

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
      // for..of loop to iterate sequentially
      for (const subtopic of subtopics) {
        console.log(
          `${subtopic.index}. ${subtopic.name} (${await translateString(
            subtopic.name
          )})`
        );
      }

      const subtopicIndex = await promptForInput(
        "Enter the number of the subtopic you want to explore: ",
        (input) => {
          const index = parseInt(input, 10);
          const selectedSubtopic = subtopics.find(
            (subtopic) => subtopic.index === index
          );
          return selectedSubtopic ? index : undefined;
        }
      );

      const selectedSubtopic = subtopics.find(
        (subtopic) => subtopic.index === subtopicIndex
      );

      console.log(`You selected "${selectedSubtopic!.name}".`);

      await page.goto(selectedSubtopic!.href);

      /* Select Article */

      await page.waitForSelector(
        "div.col-left.col-left-new.col-left-subfolder"
      );
      await page.waitForSelector("h2.title-news > a");

      const articles = await page.evaluate(() => {
        const articleLinks = Array.from(
          document.querySelectorAll("h2.title-news > a")
        );

        return articleLinks.map((link, index) => {
          const anchor = link as HTMLAnchorElement;
          return {
            index: index + 1,
            name: anchor.textContent!.trim(),
            href: anchor.href,
          };
        });
      });

      console.log("Pick an article:");
      // for..of loop to iterate sequentially
      for (const article of articles) {
        console.log(
          `${article.index}. ${article.name} (${await translateString(
            article.name
          )})`
        );
      }

      const articleIndex = await promptForInput(
        "Enter the number of the article you want to study: ",
        (input) => {
          const index = parseInt(input, 10);
          const selectedArticle = articles.find(
            (article) => article.index === index
          );
          return selectedArticle ? index : undefined;
        }
      );

      const selectedArticle = articles.find(
        (article) => article.index === articleIndex
      );

      console.log(`You selected "${selectedArticle!.name}".`);

      await page.goto(selectedArticle!.href);

      // get url, title, content, date
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
        // remove newlines and tabs from content
        content = content?.replace(/\n|\t/g, "");
        let date = document.querySelector(".date")?.textContent;

        return {
          url,
          title,
          content,
          date,
        };
      });

      console.log("result:", result);
      const answer = await promptForInput(
        "Do you want to study this article? (y/n)",
        (input) => {
          return input === "y" || input === "n" ? input : undefined;
        }
      );

      if (answer === "y") {
        console.log("Using the current article.");
        accepted = true;
      }
    }

    browser.close();

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
- parse content to remove whitespace and css code
- truncate content and question to 4000 characters / 500 words due to chatgpt limits
- make promise faster
*/

scrapeAndProcess();
