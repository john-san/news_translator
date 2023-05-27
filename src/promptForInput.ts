import readline from "readline";

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

export default promptForInput;
