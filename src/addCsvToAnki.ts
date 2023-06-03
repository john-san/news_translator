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

  // Read the CSV file
  fs.createReadStream(filePath)
    .pipe(
      csv({
        separator: ";",
        headers: ["VN_word", "EN_word", "roots", "title", "date", "url"],
        skipLines: 0,
      })
    )
    .on("data", (row: string[]) => {
      // Push each row of data to an array
      data.push(row);
    })
    .on("end", async () => {
      // Iterate over the data array, destructuring each object
      for (const { VN_word, EN_word, roots, title, date, url } of data) {
        // Prepare the payload to add the note to Anki
        const payload = {
          action: "addNote",
          version: 6,
          params: {
            note: {
              deckName: "Tiếng Việt: Chung::Tin tức::Vocab",
              modelName: "News-Vocab",
              fields: {
                VN_word,
                EN_word,
                roots,
                title,
                date,
                url,
              },
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

// Call the function to add CSV data to Anki
addCSVToAnki("vnexpress_06-02-23_vocab.csv");
