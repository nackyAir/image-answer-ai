import { createAuthClient } from 'better-auth/react';

export const { signIn, signOut, signUp, useSession, getSession } =
  createAuthClient({
    baseURL:
      process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com'
        : 'http://localhost:3000',
  });
