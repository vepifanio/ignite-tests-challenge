import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    sender_id,
    receiver_id,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }

      if (receiver_id && sender_id) {
        // Comparar se o sender_id === receiver_id

        if (receiver_id === sender_id) {
          throw new CreateStatementError.SameTransferUser();
        }

        // Procurar usuário que recebe transferencia
        const receiverUser = await this.usersRepository.findById(receiver_id);

        if (!receiverUser) {
          throw new CreateStatementError.ReceiverUserNotFound();
        }

        // Criar transferência para usuário que envia
        // enviar receive_id

        const sendStatementOperation = await this.statementsRepository.create({
          user_id,
          type,
          amount,
          description,
          receiver_id,
        });

        // Criar transferência para usuário que receber
        // sender_id = user_id

        await this.statementsRepository.create({
          user_id: receiver_id,
          type,
          amount,
          description,
          sender_id: user_id,
        });

        return sendStatementOperation;
      }

      throw new CreateStatementError.ReceiverUserNotFound();
    }

    if (type === "withdraw") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
