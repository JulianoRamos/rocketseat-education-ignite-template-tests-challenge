import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit statement", async () => {
    const user = await usersRepository.create({
      email: "johndoe@exemple.com",
      name: "John Doe",
      password: "1234",
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await usersRepository.create({
      email: "johndoe@exemple.com",
      name: "John Doe",
      password: "1234",
    });

    await createStatementUseCase.execute({
      amount: 101,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create a withdraw statement with funds", async () => {
    const user = await usersRepository.create({
      email: "johndoe@exemple.com",
      name: "John Doe",
      password: "1234",
    });

    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement with a non-existent user", async () => {
    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: "non-existent",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
