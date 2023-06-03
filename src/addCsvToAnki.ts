import { fileURLToPath } from "url";
import { dirname } from "path";
import csv from "csv-parser";
import fs from "fs";
import axios from "axios";

async function addCSVToAnki(fileName: string) {
  const data: any[] = [];
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
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
                allowDuplicate: true,
              },
              tags: [],
            },
          },
        };

        try {
          // Send the HTTP POST request to AnkiConnect API
          const response = await axios.post("http://127.0.0.1:8765", payload);
          console.log(response.data);
        } catch (error) {
          console.error("An error occurred while adding note:", error);
        }
      }
    });
}

// Call the function to add CSV data to Anki.
// addCSVToAnki("vnexpress_06-02-23_vocab.csv");
// addCSVToAnki("vnexpress_06-02-23_sentences.csv");

export default addCSVToAnki;
