import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it("Should be able to get a statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "victor",
      email: "vesp@mail.com",
      password: "password",
    });

    const initialAmount = 124;

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: initialAmount,
      description: "Deposit",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.type).toEqual(OperationType.DEPOSIT);
  });

  it("Should not be able to get a statement operation of a non existent user", async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "non-existent-user",
        statement_id: "12345",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get a statement operation of a non existent statement", async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "victor",
        email: "vesp@mail.com",
        password: "password",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "non-existent-id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
});