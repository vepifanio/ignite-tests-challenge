import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        amount,
        description,
        type,
        created_at,
        updated_at,
        sender_id,
        receiver_id,
      }) => {
        const objectStatement = {
          id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
        };

        if (sender_id) {
          Object.assign(objectStatement, { ...objectStatement, sender_id });
        }

        if (receiver_id) {
          Object.assign(objectStatement, { ...objectStatement, receiver_id });
        }

        return objectStatement;
      }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
