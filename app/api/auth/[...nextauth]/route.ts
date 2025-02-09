import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { 
  Session, 
  // Account, 
  // Profile 
} from "next-auth";
import { AuthOptions } from "next-auth";
import { DefaultUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

interface CustomUser extends DefaultUser {
  role: string;
  emailVerified: Date | null;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ 
      token, 
      user, 
      // account, 
      // profile 
    }: { 
      token: JWT; 
      user: User | AdapterUser | null;
      // account: Account | null;
      // profile?: Profile;
    }) {
      if (user) {
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect(
      // { url, baseUrl }: { url: string; baseUrl: string }
    ) {
      return '/timeline';
    }
  },
  session: {
    strategy: "jwt" as const,
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 