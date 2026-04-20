import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id:     string;
      name:   string;
      email:  string;
      phone?: string;
    } & DefaultSession['user'];
  }
}
