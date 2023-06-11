import getVocab from "../getVocab";
import { sampleText } from "./testUtils";

describe("getVocab", () => {
  it("should return an array of vocab", async () => {
    const result = await getVocab(sampleText);
    // check if it returns an array of objects. check the that VN and EN are strings
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          VN: expect.any(String),
          EN: expect.any(String),
          roots: expect.any(String),
        }),
      ])
    );
  }, 40000); // wait for 40s
});
