import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }

  export class ReceiverUserNotFound extends AppError {
    constructor() {
      super("User to receive not found", 404);
    }
  }

  export class SameTransferUser extends AppError {
    constructor() {
      super("Sender User and Receiver User can't be the same", 400);
    }
  }
}
