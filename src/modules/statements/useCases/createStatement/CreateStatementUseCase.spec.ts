import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository, 
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a new deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "victor",
      email: "vesp@mail.com",
      password: "password",
    });

    const statement: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 124,
      description: "Deposit test",
    }

    const deposit = await createStatementUseCase.execute(statement);

    expect(deposit).toHaveProperty("id");
    expect(deposit.type).toEqual("deposit");
  });

  it("Should be able to create a new withdraw statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "victor",
      email: "vesp@mail.com",
      password: "password",
    });

    const initialAmount = 124;

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: initialAmount,
      description: "Deposit test",
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: (initialAmount/2),
      description: "Withdraw test",
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.type).toEqual("withdraw");
  });

  it("Should no be able to create a statement for a not existent user", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existent-id",
        type: "deposit" as OperationType,
        amount: 124,
        description: "Deposit test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);  
  });

  it("Should not be able to create a new withdraw statement if the amount is greater then balance", async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "victor",
        email: "vesp@mail.com",
        password: "password",
      });

      const initialAmount = 124;

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: "deposit" as OperationType,
        amount: initialAmount,
        description: "Deposit test",
      });
  
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: (initialAmount * 2),
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
});