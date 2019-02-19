import { expect } from "chai";
import index from "../index";

describe("module", () => {
  it("exports a plugin as default export", () => {
    expect(index({})).to.be.instanceOf(Function);
  });
});
