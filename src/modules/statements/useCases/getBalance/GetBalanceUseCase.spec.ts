import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Should be able to get a user's balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "victor",
      email: "vesp@mail.com",
      password: "password",
    });

    const initialAmount = 124;

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: initialAmount,
      description: "Deposit",
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: initialAmount / 2,
      description: "Withdraw",
    });

    const userBalance = await getBalanceUseCase.execute({
      user_id: user.id as string
    });


    expect(userBalance).toHaveProperty("balance");
    expect(userBalance.balance).toEqual(initialAmount / 2);
  });

  it("Should not be able to get a non existent user's balance", async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({ user_id: "non-existent-id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
});