import getSentences from "../getSentences";
import { sampleText1 } from "./testUtils";

describe("getSentences", () => {
  it("should return an array of sentences", async () => {
    const result = await getSentences(sampleText1);
    // check if it returns an array of objects. check the that VN and EN are strings
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          VN: expect.any(String),
          EN: expect.any(String),
        }),
      ])
    );
  }, 120000); // wait for 120s
});
