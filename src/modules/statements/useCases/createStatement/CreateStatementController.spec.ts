import { Connection } from "typeorm";
import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("Should be able to create a new deposit statement", async () => {
    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "vesp@mail.com",
      password: "1234",
    });

    const { token } = authenticateResponse.body;

    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 100,
      description: "Test deposit"
    });

    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("deposit");
  });

  it("Should be able to create a new withdraw statement", async () => {
    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "vesp@mail.com",
      password: "1234",
    });

    const { token } = authenticateResponse.body;

    await request(app)
    .post("/api/v1/statements/deposit")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 100,
      description: "Test deposit"
    });

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 50,
      description: "Test withdraw"
    });

    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("withdraw");
  });

  it("Should not be able to create a new withdraw statement if the amount is higher then user's balance", async () => {
    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "vesp@mail.com",
      password: "1234",
    });

    const { token } = authenticateResponse.body;

    await request(app)
    .post("/api/v1/statements/deposit")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 50,
      description: "Test deposit"
    });

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 900,
      description: "Test withdraw"
    });

    console.log(response.body);
  });
});