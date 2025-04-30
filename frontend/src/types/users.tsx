import { User } from "firebase/auth";

export interface UserRole extends Pick<User, "uid" | "displayName" | "email"> {
    role: "admin" | "user";
  }