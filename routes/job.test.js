"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works: admin", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: 'c1',
          title: 'NewJob',
          salary: 5,
          equity: '0.3',
        })
        .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'NewJob',
        salary: 5,
        equity: '0.3',
        companyHandle: 'c1',
      },
    });
  });

  test("unauth: user", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
            companyHandle: 'c1',
            title: 'NewJob',
            salary: 5,
            equity: '0.3',
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
});
  test("unauth: no data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: 'J1',
              salary: 1,
              equity: '0.1',
              companyHandle: 'c1',
              companyName: 'C1',
            },
            {
              id: expect.any(Number),
              title: 'J2',
              salary: 2,
              equity: '0.2',
              companyHandle: 'c2',
              companyName: 'C2',
            },
            {
              id: expect.any(Number),
              title: 'J3',
              salary: 3,
              equity: '0.3',
              companyHandle: 'c3',
              companyName: 'C3',
            },
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          jobs: [
            {
                id: expect.any(Number),
                title: 'J1',
                salary: 1,
                equity: '0.1',
                companyHandle: 'c1',
                companyName: 'C1',
            },
            {
                id: expect.any(Number),
                title: 'J2',
                salary: 2,
                equity: '0.2',
                companyHandle: 'c2',
                companyName: 'C2',
              },
          ],
        },
    );
  });

  test("bad request", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ stuff: 32431234 });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: 'J1',
        salary: 1,
        equity: '0.1',       
        company: {
          handle: 'c1',
          name: 'C1',
          description: 'Desc1',
          numEmployees: 1,
          logoUrl: 'http://c1.img',
        },
      },
    });
  });

  test("no job", async function () {
    const resp = await request(app).get(`/jobs/654599807`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works: admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: 'NewJob',
        })
        .set('authorization', `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'NewJob',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      },
    });
  });

  test("unauth: user", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: 'jfkalsedjfa',
        })
        .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: '599',
        })
        .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("no job", async function () {
      const resp = await request(app)
        .patch(`/jobs/777732938423472`)
        .send({
            title: 'notitle',
        })
        .set('authorization', `Bearer ${adminToken}`)
    expect(resp.statusCode).toEqual(404)
  })
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works: admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set('authorization', `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauth: user", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth: anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("no job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0000630954328`)
        .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
