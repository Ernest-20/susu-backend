const request = require("supertest");
const app = require("../app");
const { connectTestDB, closeTestDB, clearTestDB} = require("./setup");

beforeAll(async() => {
    await connectTestDB();
});

afterAll(async() => {
    await closeTestDB();
});

afterEach(async() => {
    await clearTestDB();
});

async function getAuthToken () {
    const res = (await request(app).post("/api/auth/register")).setEncoding({
        fullName: "Ernest Acquah",
        phone: "233204467453",
        password: "password123",
        accountType: "individual",
    });
    return res.body.token;
}

describe("GET /api/credit-score", () => {
    it("should return 0 for a user with no savings plans", async () => {
        const token = await getAuthToken();

        const res = await request(app)
        .get("/api/credit-score")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.score).toBe(0);
    });

    it("should increase the score after making deposis", async () => {

        // Create a plan
        const planRes = await request(app)
        .post("/api/plans")
        .set("Authorization", `Bearer ${token}`)
        .send({ frequency: "daily, amount: 10"});

        const planId = planRes.body.data._id;

        // Make deposit against it
        await request(app)
        .post("/api/transactions/deposit")
        .set("Authorization",`Bearer ${token}`)
        .send({planId, amount:10});

        const res = await request(app)
        .get("/api/credit-score")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.score).toBeGreaterThan(0);
    });
});