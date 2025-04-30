import { DocumentData } from "firebase/firestore";

export const validateUser = (user: DocumentData): boolean => {
    if (
        typeof user.displayName === 'string' &&
        typeof user.email === 'string' &&
        (user.role === 'admin' || user.role === 'user')

      ) {
        return true;
      } else {
      console.warn('User document is missing required fields', user);

        return false;
      }
};