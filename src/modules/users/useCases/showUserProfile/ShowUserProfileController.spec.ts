import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
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

  it("Should be able to show a user's profile", async () => {
    const tokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "vesp@mail.com",
        password: "1234",
      });

    const { token } = tokenResponse.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to show a user profile if JWT token is missing", async () => {
    const response = await request(app)
      .get("/api/v1/profile");

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("JWT token is missing!");
  });

  it("Should not be able to show a user profile if JWT token is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer invalid-jwt-token`);;

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("JWT invalid token!");
  });
})