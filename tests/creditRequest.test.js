// tests/creditRequest.test.js

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

async function registerUser(phone) {
  const res = await request(app).post("/api/auth/register").send({
    fullName: "Test User",
    phone,
    password: "password123",
    accountType: "individual",
  });
  return { token: res.body.token, userId: res.body.user.id };
}

describe("Credit request flow", () => {
  it("allows a member to request credit, and the admin to approve it", async () => {
    // Admin creates their account and a group.
    const admin = await registerUser("+233555000001");
    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ name: "Test Group" });
    const groupId = groupRes.body.data._id;

    // A second user registers and gets added to the group.
    const member = await registerUser("+233555000002");
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ phone: "+233555000002" });

    // Admin creates a product with minCreditScore 0, so anyone qualifies.
    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        name: "Blender",
        price: 300,
        shop: "TechMart",
        category: "appliances",
        minCreditScore: 0,
      });
    const productId = productRes.body.data._id;

    // The MEMBER requests credit on that product, through the group.
    const requestRes = await request(app)
      .post("/api/credit-requests")
      .set("Authorization", `Bearer ${member.token}`)
      .send({ productId, groupId });

    expect(requestRes.statusCode).toBe(201);
    expect(requestRes.body.data.status).toBe("pending");

    const creditRequestId = requestRes.body.data._id;

    // The ADMIN views pending requests for the group.
    const pendingRes = await request(app)
      .get(`/api/credit-requests/group/${groupId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(pendingRes.body.data.length).toBe(1);

    // The ADMIN approves it.
    const decisionRes = await request(app)
      .patch(`/api/credit-requests/${creditRequestId}/decision`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ decision: "approved" });

    expect(decisionRes.statusCode).toBe(200);
    expect(decisionRes.body.data.status).toBe("approved");
  });

  it("prevents a non-admin from approving a request", async () => {
    const admin = await registerUser("+233555000003");
    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ name: "Test Group 2" });
    const groupId = groupRes.body.data._id;

    const member = await registerUser("+233555000004");
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ phone: "+233555000004" });

    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        name: "Fan",
        price: 200,
        shop: "HomePlus",
        category: "appliances",
        minCreditScore: 0,
      });
    const productId = productRes.body.data._id;

    const requestRes = await request(app)
      .post("/api/credit-requests")
      .set("Authorization", `Bearer ${member.token}`)
      .send({ productId, groupId });

    const creditRequestId = requestRes.body.data._id;

    // The MEMBER (not the admin) tries to approve their own request.
    const decisionRes = await request(app)
      .patch(`/api/credit-requests/${creditRequestId}/decision`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({ decision: "approved" });

    expect(decisionRes.statusCode).toBe(403);
  });
});