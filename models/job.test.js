"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Teacher",
    salary: 40,
    equity: 0.3,
    companyHandle: "c2",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual( {
        id: 10,
        title: "Teacher",
        salary: 40,
        equity: 0.3,
        companyHandle: "c2",
      });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
          FROM jobs
          WHERE id = 10`);
    expect(result.rows).toEqual([
        {
            id: 10,
            title: "Teacher",
            salary: 40,
            equity: 0.3,
            companyHandle: "c2",
        },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newJob);
      await Company.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 7,
        title: 'Software Engineer',
        salary: 60,
        equity: 0.5,
        companyHandle: 'c1'
      },
      {
        id: 8,
        title: 'Accountant',
        salary: 40,
        equity: 0.7,
        companyHandle: 'c2'
      },
      {
        id: 9,
        title: 'Architect',
        salary: 50,
        equity: 0.3,
        companyHandle: 'c3'
      },
    ]);
  });
});

/************************************** search */
/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Firefighter",
    salary: 30,
    equity: 0.1,
  };

  test("works", async function () {
    let job = await Company.update(8, updateData);
    expect(job).toEqual({
      id: 8,
      ...updateData,
      company_handle: "c2",
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 8`);
    expect(result.rows).toEqual([{
      id: 8 ,
      title: "Firefighter",
      salary: 30,
      equity: 0.1,
      company_handle: "c2",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "Software Developer",
      salary: null,
      equity: null,
    };

    let job = await Job.update(7, updateDataSetNulls);
    expect(company).toEqual({
      id: 7,
      ...updateDataSetNulls,
      company_handle: "c1",
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 7`);
    expect(result.rows).toEqual([{
      id: 7,
      title: "Software Developer",
      salary: null,
      equity: null,
      company_handle: "c1",
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update(999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update(9, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove(9);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=9");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove(849);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
