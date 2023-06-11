import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
dotenv.config();
import { sleep, parseJson, translateString } from "./utils";

type Sentence = {
  VN: string;
  EN: string;
};

export default async function getSentences(
  content: string,
  num: number = 20,
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" = "C1"
): Promise<Sentence[]> {
  const api = new ChatGPTAPI({
    apiKey: process.env.CHATGPT_API_KEY ?? "",
    completionParams: {
      model: "gpt-3.5-turbo",
      temperature: 0.5, // lower = more conservative, deterministic text
    },
  });
  // if num is greater than CHUNK_SIZE, ask for CHUNK_SIZE at a time until num is less than CHUNK_SIZE
  let result: string[] = [];
  let tempArray: string[] = [];

  let CHUNK_SIZE = 10;
  let remaining = num;
  let parentMessageId: string | undefined = "";

  while (remaining > 0) {
    let numToAskFor = remaining >= CHUNK_SIZE ? CHUNK_SIZE : remaining;
    let firstTimeAsking = remaining == num;
    console.log(
      `Asking ChatGPT for ${firstTimeAsking ? "" : "more "}sentences.`
    );
    let question = `From the following text, can you provide me with ${numToAskFor} ${
      firstTimeAsking ? "" : "NEW(not given previously)"
    } ${difficulty} level vietnamese sentences to understand the text in an array in valid JSON format?: ["vietnamese sentence",...]. Here is the content. ${content}`;

    // Todo: fix any type
    let res: any = await api.sendMessage(question, { parentMessageId });
    tempArray = parseJson(res.text);

    // if tempArray is empty, ask again
    let counter = 1;
    while (tempArray.length == 0 && counter < 6) {
      console.log(
        `Didn't get array of sentences. Will ask again after 10 second cooldown. Retries left: ${
          6 - counter
        }`
      );
      await sleep(10);
      // follow up question
      question = `I didn't get an array of sentences. Please give me ${numToAskFor} ${
        remaining == num ? "" : "NEW(not given previously)"
      } ${difficulty} level sentences to understand the previously given Vietnamese text in an array in valid JSON format: ["vietnamese sentence",...].`;
      res = await api.sendMessage(question, {
        parentMessageId: res.id,
      });

      // set parentMessageId to the id of the last message for next iteration
      parentMessageId = res.parentMessageId;

      tempArray = parseJson(res.text);
      counter++;
    }

    console.log("Successfully retrieved sentences for this iteration.");

    // merge tempArray with result
    result = result.concat(tempArray);
    // decrement remaining by CHUNK_SIZE. If remaining is less than CHUNK_SIZE, it is on the last iteration, so set remaining to 0
    remaining = remaining >= CHUNK_SIZE ? remaining - CHUNK_SIZE : 0;
  }
  // truncate result to num just in case result is greater than num. ChatGPT sometimes provides +1 additional result
  result = result.slice(0, num);

  console.log("result.length:", result.length);

  // map result to object with VN and EN
  console.log("Translating sentences to english...");
  let sentences: Sentence[] = [];
  for (let i = 0; i < result.length; i++) {
    const text = result[i];
    if (text !== null) {
      const translatedText = await translateString(text);
      sentences.push({
        VN: text,
        EN: translatedText,
      });
    }
  }

  return sentences;
}
