import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });


  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "victor",
      email: "vesp@mail.com",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new user with a existent email", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "vesp",
        email: "vesp@mail.com",
        password: "1234"
      });

      await createUserUseCase.execute({
        name: "victor",
        email: "vesp@mail.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })
});