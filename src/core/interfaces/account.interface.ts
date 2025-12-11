import { Role } from "@prisma/client";

export interface Account {
  id: string;
  email: string;
  role: Role;
}