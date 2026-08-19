// tests/product.test.js

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

async function getAuthToken() {
  const res = await request(app).post("/api/auth/register").send({
    fullName: "Ernest Acquah",
    phone: "+233555000111",
    password: "password123",
    accountType: "individual",
  });
  return res.body.token;
}

describe("POST /api/products", () => {
  it("should create a product", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Standing Fan",
        price: 320,
        shop: "HomePlus",
        category: "appliances",
        minCreditScore: 0, // 0 = everyone qualifies, for easy testing
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Standing Fan");
  });
});

describe("GET /api/products", () => {
  it("should mark a product as eligible when minCreditScore is 0", async () => {
    const token = await getAuthToken();

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Blender",
        price: 300,
        shop: "TechMart",
        category: "appliances",
        minCreditScore: 0,
      });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].creditEligible).toBe(true);
  });

  it("should mark a product as NOT eligible when score requirement is too high", async () => {
    const token = await getAuthToken();

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Samsung TV",
        price: 2800,
        shop: "TechMart",
        category: "electronics",
        minCreditScore: 90, // brand-new user has creditScore of 0, won't qualify
      });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data[0].creditEligible).toBe(false);
  });

  it("should filter products by category", async () => {
    const token = await getAuthToken();

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Office Chair", price: 450, shop: "FurnCo", category: "furniture" });

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Blender", price: 300, shop: "TechMart", category: "appliances" });

    const res = await request(app)
      .get("/api/products?category=furniture")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe("furniture");
  });
});