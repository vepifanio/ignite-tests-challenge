import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate a existent user", async () => {
    await createUserUseCase.execute({
      name: "victor",
      email: "vesp@mail.com",
      password: "1234",
    });

    const user = await authenticateUserUseCase.execute({
      email: "vesp@mail.com",
      password: "1234",
    });

    expect(user).toHaveProperty("user");
    expect(user).toHaveProperty("token");
  });

  it("Should not be able to authenticate non existent user", async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: "nonexistent@mail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user with incorrect password", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "victor",
        email: "vesp@mail.com",
        password: "1234",
      });
  
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});