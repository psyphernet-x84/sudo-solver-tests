const chai = require("chai");
const assert = chai.assert;

const Solver = require("../controllers/sudoku-solver.js");
const {
  rowMap,
  colMap,
  regionMap,
  locator,
  checker,
} = require("../controllers/puzzleChecker");
const sudokuMap = require("../controllers/sectorMaker");
let solver = new Solver();

const validPuzzle =
  "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
const coorObject = locator("a1");
const objAnalysis = checker(coorObject, validPuzzle);

suite("Unit Tests", () => {
  test("81 characters", (done) => {
    assert.equal(solver.validate(validPuzzle), undefined);
    done();
  });
  test("invalid characters", (done) => {
    const invalidCharacter =
      "v.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    assert.hasAllKeys(solver.validate(invalidCharacter), ["error"]);
    done();
  });
  test("not 81 characters", (done) => {
    const not81length =
      "9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    assert.hasAllKeys(solver.validate(not81length), ["error"]);
    done();
  });
  test("valid Row", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "7"), { valid: true });
    done();
  });
  test("Invalid Row", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "9"), {
      valid: false,
      conflict: ["row", "region"],
    });
    done();
  });
  test("valid column", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "7"), { valid: true });
    done();
  });
  test("Invalid column", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "6"), {
      valid: false,
      conflict: ["column"],
    });
    done();
  });
  test("valid region", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "7"), { valid: true });
    done();
  });
  test("invalid region", (done) => {
    assert.deepEqual(solver.checkPlacement(objAnalysis, "3"), {
      valid: false,
      conflict: ["region"],
    });
    done();
  });
  test(" valid string pass the solver", (done) => {
    assert.hasAllKeys(solver.solve(validPuzzle, sudokuMap), ["solution"]);
    done();
  });
  test("Invalid string fails the solver", (done) => {
    const invalidString =
      "9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    assert.hasAllKeys(solver.solve(invalidString, sudokuMap), ["error"]);
    done();
  });
  test(" expected solution", (done) => {
    assert.deepEqual(solver.solve(validPuzzle, sudokuMap), {
      solution:
        "769235418851496372432178956174569283395842761628713549283657194516924837947381625",
    });
    done();
  });
});
