// NextAuth v5 configuration - version 3
import NextAuth, { type DefaultSession } from"next-auth";
import GitHub from"next-auth/providers/github";

declare module"next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      login?: string;
    } & DefaultSession["user"];
  }
}

declare module"@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: { params: { scope:"read:user public_repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile?.login) {
        token.login = profile.login as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.login = token.login;
      }
      return session;
    },
  },
  trustHost: true,
});

export const { GET, POST } = handlers;
