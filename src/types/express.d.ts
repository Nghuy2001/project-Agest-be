import { AccountPayload } from '../auth/interfaces/account-payload.interface';

declare global {
  namespace Express {
    interface Request {
      account?: AccountPayload;
    }
  }
}
