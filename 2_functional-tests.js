const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
const {
  rowMap,
  colMap,
  regionMap,
  locator,
  checker,
} = require("../controllers/puzzleChecker");
const sudokuMap = require("../controllers/sectorMaker");
const assertionAnalyser = require("../assertion-analyser");

const validPuzzle =
  "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
const coorObject = locator("a1");
const objAnalysis = checker(coorObject, validPuzzle);
suite("Functional Tests", () => {
  test("solve valid puzzle POST /api/solve", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({ puzzle: validPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        let completedPuzzle =
          "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
        assert.equal(res.body.solution, completedPuzzle);
        done();
      });
  });
  test("missing puzzle POST /api/solve", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Required field missing");
        done();
      });
  });
  test("puzzle with invalid characters POST/api/solve", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({
        puzzle:
          "g.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });
  test("puzzle with incorret length POST/api/solve", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({
        puzzle:
          "9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(
          res.body.error,
          "Expected puzzle to be 81 characters long"
        );
        done();
      });
  });
  test("puzzle can not be solvec POST/api/solve", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({
        puzzle:
          "9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Puzzle cannot be solved");
        done();
      });
  });
  test("Check a puzzle placement with all fields POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "a1",
        value: "7",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.valid, true);

        done();
      });
  });
  test("Check a puzzle placement with 1 conflict POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "a1",
        value: "2",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.conflict, ["region"]);

        done();
      });
  });
  test("Check a puzzle placement with multiple conflicts POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "a1",
        value: "1",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.conflict, ["row", "column"]);

        done();
      });
  });
  test("Check a puzzle placement with all conflicts POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "a1",
        value: "5",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.conflict, ["row", "column", "region"]);

        done();
      });
  });
  test("Check a puzzle missing fields POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Required field(s) missing");

        done();
      });
  });
  test("Check a puzzle with invalid invalid character POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......194t....4.37.4.3..6..",
        coordinate: "a1",
        value: "5",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid characters in puzzle");

        done();
      });
  });
  test("Check a puzzle with incorrect length character POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
        coordinate: "a1",
        value: "5",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(
          res.body.error,
          "Expected puzzle to be 81 characters long"
        );

        done();
      });
  });
  test("Check a puzzle with invalid coordinate POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "p70",
        value: "5",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid coordinate");

        done();
      });
  });
  test("Check a puzzle with invalid value POST /api/check", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: "a1",
        value: "0",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid value");

        done();
      });
  });
});
