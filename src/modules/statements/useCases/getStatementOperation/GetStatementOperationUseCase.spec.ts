import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("GetStatementOperation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to get the statement operation", async () => {
    const user = await usersRepository.create({
      email: "johndoe@exemple.com",
      name: "John Doe",
      password: "1234",
    });

    const statement = await statementsRepository.create({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(response).toBe(statement);
  });

  it("should be able to get the statement operation", async () => {
    const statement = await statementsRepository.create({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: "non-existent",
    });
    await expect(
      getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: "non-existent",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should be able to get the statement operation", async () => {
    const user = await usersRepository.create({
      email: "johndoe@exemple.com",
      name: "John Doe",
      password: "1234",
    });

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "non-existent",
        user_id: user.id as string,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
