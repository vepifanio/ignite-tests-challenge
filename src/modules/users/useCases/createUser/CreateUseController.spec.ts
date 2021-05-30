import { Connection } from "typeorm";
import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "victor",
        email: "vesp@mail.com",
        password: "1234"
      });

    expect(response.statusCode).toEqual(201);
  });

  it("Should not be able to create a new user with a existent email", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "victor",
        email: "vesp@mail.com",
        password: "1234"
      });

    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "vesp",
      email: "vesp@mail.com",
      password: "4321"
    });

    expect(response.body.message).toBeTruthy();
    expect(response.statusCode).toEqual(400);
  })
});