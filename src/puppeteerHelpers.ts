import { Page } from "puppeteer";
import { promptForInput } from "./utils";
import { translateString } from "./translateSentences";

async function selectItem(
  page: Page,
  selector: string,
  itemName: string,
  excludedItems: string[] = []
) {
  await page.waitForSelector(selector);

  const items = await page.evaluate(
    (selector: string, excludedItems: string[]) => {
      // get items and then filter out excluded items
      const itemLinks = Array.from(document.querySelectorAll(selector)).filter(
        (link) => {
          const anchor = link as HTMLAnchorElement;
          return !excludedItems.includes(anchor.textContent!.trim());
        }
      );

      return itemLinks.map((link, index) => {
        const anchor = link as HTMLAnchorElement;
        return {
          index: index + 1,
          name: anchor.textContent!.trim(),
          href: anchor.href,
        };
      });
    },
    selector,
    excludedItems
  );

  // translate item names
  // todo: fix any type
  const promises = items.map((item: any) => translateString(item.name));
  const translatedStrings = await Promise.all(promises);

  console.log(`Pick a ${itemName}:`);

  // Wait for all promises to resolve before logging translated strings
  items.forEach((item: any, index: number) => {
    console.log(`${index + 1}. ${item.name} (${translatedStrings[index]})`);
  });

  const selectedItemIndex = await promptForInput(
    `Enter the number of the ${itemName} you want to explore: `,
    (input: any) => {
      const index = parseInt(input, 10);
      const selectedItem = items.find((item: any) => item.index === index);
      return selectedItem ? index : undefined;
    }
  );

  const selectedItem = items.find(
    (item: any) => item.index === selectedItemIndex
  );

  console.log(`You selected "${selectedItem!.name}".`);

  // go to the selected item's page
  await page.goto(selectedItem!.href);
}

export { selectItem };
