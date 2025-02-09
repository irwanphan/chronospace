import { prisma } from "@/lib/prisma";
import NextAuth, { User, AuthOptions, DefaultUser } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

interface CustomUser extends DefaultUser {
  role: string;
  emailVerified: Date | null;
}

interface MenuAccess {
  timeline: boolean;
  workspace: boolean;
  projectPlanning: boolean;
  budgetPlanning: boolean;
  userManagement: boolean;
  workspaceManagement: boolean;
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
    }: { 
      token: JWT; 
      user: User | AdapterUser | null;
    }) {
      if (user) {
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        const userAccess = await prisma.userAccess.findUnique({
          where: { userId: token.sub }
        });

        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.access = {
          menuAccess: (userAccess?.menuAccess as unknown as MenuAccess) || {
            timeline: false,
            workspace: false,
            projectPlanning: false,
            budgetPlanning: false,
            userManagement: false,
            workspaceManagement: false
          }
        };
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