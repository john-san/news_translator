import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import csv from "csv-parser";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = `${__dirname}\\data\\`;
// const filename = path.resolve(process.cwd(), __filename);
// const __dirname = dirname(filename);
// const dataPath = path.join(__dirname, "data");

type writeToCsvProps = {
  url: string;
  title: string;
  content: string;
  date: string;
  vocab: {
    VN: string;
    EN: string;
    roots: string;
  }[];
  sentences: {
    VN: string;
    EN: string;
  }[];
};

async function writeToCsv({
  url,
  title,
  date,
  vocab,
  sentences,
}: writeToCsvProps): Promise<void> {
  // create folder if it doesn't exist
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  // If you don't want to write a header line, don't give title to header elements and just give field IDs as a string.
  // removing titles for now
  // Set up CSV writer for vocab
  let csvWriter = createCsvWriter({
    path: `${dataPath}/vnexpress_${date}_vocab.csv`,
    header: ["VN_word", "EN_word", "roots", "title", "date", "url"],
    fieldDelimiter: ";",
  });

  const baseData = {
    title,
    date,
    url,
  };

  const vocabData = vocab.map((word) => {
    return {
      VN_word: word.VN,
      EN_word: word.EN,
      roots: word.roots,
      ...baseData,
    };
  });

  let fileName = `vnexpress_${date}_vocab.csv`;
  try {
    await csvWriter.writeRecords(vocabData);
    console.log(`${fileName} was written successfully`);
    await addCsvToAnki(fileName);
    console.log(`${fileName} was added to Anki successfully`);
  } catch (err) {
    console.log(err);
  }

  // Set up CSV writer for sentences
  csvWriter = createCsvWriter({
    path: `${dataPath}/vnexpress_${date}_sentences.csv`,
    header: ["VN_sentence", "EN_sentence", "title", "date", "url"],
    fieldDelimiter: ";",
  });

  const sentencesData = sentences.map((sentence) => {
    return {
      VN_sentence: sentence.VN,
      EN_sentence: sentence.EN,
      ...baseData,
    };
  });

  fileName = `vnexpress_${date}_sentences.csv`;
  try {
    await csvWriter.writeRecords(sentencesData);
    console.log(`${fileName} was written successfully`);
    await addCsvToAnki(fileName);
    console.log(`${fileName} was added to Anki successfully`);
  } catch (err) {
    console.log(err);
  }
}

async function addCsvToAnki(fileName: string) {
  const data: any[] = [];
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = dirname(__filename);
  const filePath = `${__dirname}/data/${fileName}`;

  // check if fileName includes "vocab" or "sentences"
  let headers: string[];
  let deckName: string;
  let modelName: string;
  if (fileName.includes("vocab")) {
    headers = ["VN_word", "EN_word", "roots", "title", "date", "url"];
    deckName = "Tiếng Việt: Chung::Tin tức::Vocab";
    modelName = "News-Vocab";
  } else if (fileName.includes("sentences")) {
    headers = ["VN_sentence", "EN_sentence", "title", "date", "url"];
    deckName = "Tiếng Việt: Chung::Tin tức::Sentences";
    modelName = "News-Sentences";
  } else {
    throw new Error("Invalid file name");
  }

  // Read the CSV file
  fs.createReadStream(filePath)
    .pipe(
      csv({
        separator: ";",
        headers: headers,
        skipLines: 0,
      })
    )
    .on("data", (row: string[]) => {
      // Push each row of data to an array
      data.push(row);
    })
    .on("end", async () => {
      // Iterate over the data array, destructuring each object
      for (const row of data) {
        // Create an empty object to store the field values
        const fields: { [key: string]: string } = {};

        // Map the header names to the corresponding field values
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          fields[header] = row[header];
        }

        // Prepare the payload to add the note to Anki
        const payload = {
          action: "addNote",
          version: 6,
          params: {
            note: {
              deckName,
              modelName,
              fields,
              options: {
                allowDuplicate: false,
              },
              tags: [],
            },
          },
        };

        try {
          // Send the HTTP POST request to AnkiConnect API
          await axios.post("http://127.0.0.1:8765", payload);
        } catch (error) {
          console.error("An error occurred while adding note:", error);
        }
      }
    });
}

export default writeToCsv;
