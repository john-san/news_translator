import { createTitle } from "../utils";
import { format } from "date-fns";

describe("createTitle", () => {
  it("should return a dated title without diacritics", () => {
    const result = createTitle("Không người thân");
    const date = format(new Date(), "MM-dd-yy");
    expect(result).toEqual(`${date}_khong-nguoi-than`);
  });
});
