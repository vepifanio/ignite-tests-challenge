import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("Should be able to show the user profile with the given id", async () => {
    const user = await createUserUseCase.execute({
      name: "victor",
      email: "vesp@mail.com",
      password: "12345",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty("id");
  });

  it("Should not be able to show a profile of a non existent user", async () => {
    await expect(async () =>{
      await showUserProfileUseCase.execute("non-existent-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
});