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

interface ActivityAccess {
  createProject: boolean;
  editProject: boolean;
  deleteProject: boolean;
}

interface WorkspaceAccess {
  createPurchaseRequest: boolean;
  reviewApprovePurchaseRequest: boolean;
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
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true
          }
        });

        console.log("Found user:", user); // Debug log

        if (!user) {
          console.log("No user found for email:", credentials.email); // Debug log
          throw new Error("No user found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("Password valid:", isPasswordValid); // Debug log

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
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
          },
          activityAccess: (userAccess?.activityAccess as unknown as ActivityAccess) || {
            createProject: false,
            editProject: false,
            deleteProject: false
          },
          workspaceAccess: (userAccess?.workspaceAccess as unknown as WorkspaceAccess) || {
            createPurchaseRequest: false,
            reviewApprovePurchaseRequest: false
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
  },
  debug: true, // Enable debug mode
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 