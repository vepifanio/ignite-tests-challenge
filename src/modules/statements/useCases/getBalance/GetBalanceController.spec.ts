import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(
      `
        INSERT INTO USERS(id, name, email, password, created_at, updated_at) values('${id}', 'victor', 'vesp@mail.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get a users balance", async () => {
    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "vesp@mail.com",
      password: "1234",
    });

    const { token } = authenticateResponse.body;

    await request(app)
    .post("/api/v1/statements/deposit")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 10,
      description: "Test deposit"
    });

    await request(app)
    .post("/api/v1/statements/withdraw")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 5,
      description: "Test withdraw"
    });

    const balanceResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(balanceResponse.body).toHaveProperty("balance");
  });
});