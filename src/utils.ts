import readline from "readline";

function parseDate(date: string): string | null {
  // get date and parse it to just get the date
  // example "Thứ hai, 8/5/2023, 15:58 (GMT+7)" -> "5/8/23"
  try {
    // split by comma and strip whitespace
    date = date!.split(",")[1].trim();
    // format date to mm/dd/yy
    const dateArray = date.split("/");
    // pad 0 to single digit days and months
    if (dateArray[0].length === 1) {
      dateArray[0] = "0" + dateArray[0];
    }
    if (dateArray[1].length === 1) {
      dateArray[1] = "0" + dateArray[1];
    }
    // remove first two digits from year
    dateArray[2] = dateArray[2].slice(2);
    date = `${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`;
    return date;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

// async pause function that accepts seconds
async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// remove trailing comma from json string
function removeTrailingComma(jsonString: string): string {
  const regex = /,\s*]/g;
  return jsonString.replace(regex, "]");
}

// parse json string to array
function parseJson(text: string): any[] {
  // strip text of all newlines to make parsing easier and viewable in console
  text = text.replace(/\n/g, "");
  // remove trailing comma from json string
  text = removeTrailingComma(text);
  let start = text.indexOf("["); // find index of first '['
  let end = text.lastIndexOf("]"); // find index of last ']'

  console.log("text:", text);
  // console.log('start:', start)
  // console.log('end:', end)

  // if both '[' and ']' exist, parse json
  if (start != -1 && end != -1) {
    let json = text.substring(start, end + 1);
    // console.log('json:', json)
    try {
      const parsedJson: any[] = JSON.parse(json);
      // console.log('parsedJson:', parsedJson)
      return parsedJson;
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
  return [];
}

const promptForInput = async <T>(
  question: string,
  validator: (input: string) => T | undefined
): Promise<T> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const input = await new Promise<string>((resolve) => {
      rl.question(question, (input) => {
        resolve(input);
      });
    });

    const validatedInput = validator(input);
    if (validatedInput !== undefined) {
      rl.close();
      return validatedInput;
    }

    console.log("Invalid input. Please try again.");
  }
};

export { parseDate, sleep, parseJson, promptForInput };
