import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb, User } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Child Code', type: 'text' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const db = getDb();
        let user: User | undefined;

        // Check if logging in as child or researcher
        if (credentials.loginType === 'child') {
          user = db.prepare(
            'SELECT * FROM users WHERE child_code = ? AND role = ?'
          ).get(credentials.identifier.toUpperCase(), 'child') as User | undefined;
        } else {
          user = db.prepare(
            'SELECT * FROM users WHERE email = ? AND role IN (?, ?)'
          ).get(credentials.identifier, 'researcher', 'admin') as User | undefined;
        }

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.first_name || user.child_code || 'User',
          email: user.email || user.child_code,
          role: user.role,
          childCode: user.child_code,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
        token.childCode = user.childCode || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
        session.user.childCode = token.childCode as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production-12345',
};

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    role: string;
    childCode?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      childCode?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    userId?: string;
    childCode?: string;
  }
}

