import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

  it("Should be able to authenticate a user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "vesp@mail.com",
        password: "1234"
      });

    expect(response.body).toHaveProperty("token");
  });
})