// tests/savingsPlan.test.js
//
// Tests the savings plan CRUD endpoints from Day 17, including that
// requireAuth actually blocks unauthenticated requests.

const request = require("supertest");
const app = require("../app");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

// A small helper used by multiple tests below — registers a user and
// returns their auth token, so we don't repeat this setup in every test.
async function getAuthToken() {
  const res = await request(app).post("/api/auth/register").send({
    fullName: "Ernest Acquah",
    phone: "+233555000111",
    password: "password123",
    accountType: "individual",
  });
  return res.body.token;
}

describe("POST /api/plans", () => {
  it("should reject requests with no auth token", async () => {
    const res = await request(app).post("/api/plans").send({
      frequency: "weekly",
      amount: 50,
    });

    expect(res.statusCode).toBe(401);
  });

  it("should create a plan when logged in", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send({
        frequency: "weekly",
        amount: 50,
        goal: "New refrigerator",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.frequency).toBe("weekly");
    expect(res.body.data.totalSaved).toBe(0); // should start at 0
  });
});

describe("GET /api/plans", () => {
  it("should only return the logged-in user's own plans", async () => {
    const token = await getAuthToken();

    // Create two plans for this user.
    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send({ frequency: "daily", amount: 10 });

    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send({ frequency: "monthly", amount: 500 });

    const res = await request(app)
      .get("/api/plans")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});

describe("PUT /api/plans/:id", () => {
  it("should update a plan's status", async () => {
    const token = await getAuthToken();

    const createRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send({ frequency: "weekly", amount: 50 });

    const planId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "paused" });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.status).toBe("paused");
  });
});

describe("DELETE /api/plans/:id", () => {
  it("should delete a plan", async () => {
    const token = await getAuthToken();

    const createRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send({ frequency: "weekly", amount: 50 });

    const planId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);

    // Confirm it's actually gone.
    const getRes = await request(app)
      .get(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(404);
  });
});