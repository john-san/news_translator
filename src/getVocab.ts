import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
dotenv.config();
import { sleep, parseJson } from "./utils";

type Vocab = {
  VN: string;
  EN: string;
  roots: string;
};

export default async function getVocab(
  content: string,
  num: number = 20,
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" = "C1"
): Promise<Vocab[]> {
  const api = new ChatGPTAPI({
    apiKey: process.env.CHATGPT_API_KEY ?? "",
    completionParams: {
      model: "gpt-3.5-turbo",
      temperature: 0.5, // lower = more conservative, deterministic text
    },
  });
  // if num is greater than 20, ask for 20 at a time until num is less than 20
  let result: Vocab[] = [];
  let tempArray: Vocab[] = [];

  let CHUNK_SIZE = 20;
  let remaining = num;
  let parentMessageId: string | undefined = "";

  while (remaining > 0) {
    let numToAskFor = remaining >= CHUNK_SIZE ? CHUNK_SIZE : remaining;
    let firstTimeAsking = remaining == num;
    console.log(`Asking ChatGPT for ${firstTimeAsking ? "" : "more "}vocab.`);
    let question = `From the following text, can you provide me with ${numToAskFor} ${
      firstTimeAsking ? "" : "NEW(not given previously)"
    } ${difficulty} level key terms to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words. Please give me the flashcards in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "roots": "VN root1(EN translation), VN root2(EN translation)..."},...]. Here is the content: ${content}`;

    // Todo: fix any type
    let res: any = await api.sendMessage(question, { parentMessageId });
    tempArray = parseJson(res.text);

    // if tempArray is empty, ask again
    let counter = 1;
    while (tempArray.length == 0 && counter < 6) {
      console.log(
        `Didn't get an array of vocab. Will ask again after 10 second cooldown. Retries left: ${
          6 - counter
        }`
      );
      await sleep(10);
      // follow up question
      question = `I didn't get an array of objects in valid JSON format. Please try again. Please give me ${numToAskFor} ${
        remaining == num ? "" : "NEW(not given previously)"
      } ${difficulty} level key terms from the previous Vietnamese text in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "roots": "VN root1(EN translation), VN root2(EN translation),..."},...]`;

      res = await api.sendMessage(question, {
        parentMessageId: res.id,
      });

      // set parentMessageId to the id of the last message for next iteration
      parentMessageId = res.parentMessageId;

      tempArray = parseJson(res.text);
      counter++;
    }

    console.log("Successfully retrieved vocab for this iteration.");

    // merge tempArray with result
    result = result.concat(tempArray);
    // decrement remaining by CHUNK_SIZE. If remaining is less than CHUNK_SIZE, it is on the last iteration, so set remaining to 0
    remaining = remaining >= CHUNK_SIZE ? remaining - CHUNK_SIZE : 0;
  }
  // truncate result to num just in case result is greater than num. ChatGPT sometimes provides +1 additional result
  result = result.slice(0, num);

  console.log("result.length:", result.length);

  return result;
}
