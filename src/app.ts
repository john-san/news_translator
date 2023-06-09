// for VN Express
import puppeteer from "puppeteer";
import { selectItem } from "./puppeteerUtils";
import getVocab from "./getVocab";
import getSentences from "./getSentences";
import { parseDate, promptForInput, createTitle } from "./utils";
import { addCsvToAnki, writeToCsv } from "./csvFunctions";

const scrape = async (): Promise<any> => {
  try {
    let accepted = false;
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let result: any = {};

    while (accepted == false) {
      await page.goto("https://vnexpress.net");

      /* Select Topic */
      let selector = "nav.main-nav > ul.parent > li > a";
      let itemName = "topic";
      let excludedItems = [
        "",
        "Video",
        "Podcasts",
        "Mới nhất",
        "Thư giãn",
        "Tâm sự",
        "Tất cả",
      ];
      await selectItem(page, selector, itemName, excludedItems);

      /* Select Subtopic */
      selector = "ul.ul-nav-folder > li a";
      itemName = "subtopic";
      await selectItem(page, selector, itemName);

      /* Select Article */
      selector = "h2.title-news > a";
      itemName = "article";
      await selectItem(page, selector, itemName);

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
        // remove multiple spaces from content
        content = content?.replace(/\s(\s+|\n+)/g, " ");
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
        (input: any) => {
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

  result.sentences = await getSentences(result.content);
  console.log(result.sentences);

  await writeToCsv(result);

  const formattedTitle = createTitle(result.title);
  await addCsvToAnki(`${formattedTitle}_vocab.csv`);
  await addCsvToAnki(`${formattedTitle}_sentences.csv`);
}

scrapeAndProcess();
