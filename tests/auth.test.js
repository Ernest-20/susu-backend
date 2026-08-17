// tests/auth.test.js
//
// Tests the register and login endpoints from Day 16.

const request = require("supertest");
const app = require("../app");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");

// beforeAll/afterAll/afterEach are Jest's built-in "lifecycle" functions —
// they run automatically at the right moments during the test suite.
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

// describe() groups related tests together under one readable label.
describe("POST /api/auth/register", () => {
  // it() (or test()) defines ONE individual test case.
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Ernest Acquah",
      phone: "+233555000111",
      password: "password123",
      accountType: "individual",
    });

    // expect() checks that something matches what we expect.
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.phone).toBe("+233555000111");
    // Confirming the password is NEVER sent back, even hashed —
    // this protects against accidentally leaking sensitive data.
    expect(res.body.user.password).toBeUndefined();
  });

  it("should reject registration with a duplicate phone number", async () => {
    // Register once first.
    await request(app).post("/api/auth/register").send({
      fullName: "Ernest Acquah",
      phone: "+233555000111",
      password: "password123",
      accountType: "individual",
    });

    // Try registering AGAIN with the same phone number.
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Different Name",
      phone: "+233555000111",
      password: "password456",
      accountType: "individual",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject registration with a short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Ernest Acquah",
      phone: "+233555000222",
      password: "short", // under 8 characters — should fail Joi validation
      accountType: "individual",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});

describe("POST /api/auth/login", () => {
  // beforeEach here runs before EACH test in this describe block only —
  // ensures a user exists to log in with.
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Ernest Acquah",
      phone: "+233555000111",
      password: "password123",
      accountType: "individual",
    });
  });

  it("should log in successfully with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      phone: "+233555000111",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should reject login with the wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      phone: "+233555000111",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});