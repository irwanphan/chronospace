import { prisma } from "@/lib/prisma";
import { User, AuthOptions, DefaultUser } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { MenuAccess, ActivityAccess, WorkspaceAccess } from "@/types/access-control";

interface CustomUser extends DefaultUser {
  role: string;
  roleId: string;
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
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            userRoles: {
              include: {
                role: true
              }
            },
            access: true
          }
        });

        // console.log("Found user:", user); // Debug log

        if (!user) {
          // console.log("No user found for email:", credentials.email); // Debug log
          throw new Error("No user found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // console.log("Password valid:", isPasswordValid); // Debug log

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        const menuAccess = typeof user.access?.menuAccess === 'string' 
          ? JSON.parse(user.access.menuAccess)
          : user.access?.menuAccess || {};

        const activityAccess = typeof user.access?.activityAccess === 'string'
          ? JSON.parse(user.access.activityAccess)
          : user.access?.activityAccess || {};

        const workspaceAccess = typeof user.access?.workspaceAccess === 'string'
          ? JSON.parse(user.access.workspaceAccess)
          : user.access?.workspaceAccess || {};

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.userRoles[0].role.roleName,
          roleId: user.userRoles[0].role.id,
          access: {
            menuAccess,
            activityAccess,
            workspaceAccess
          }
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
        token.roleId = (user as CustomUser).roleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        const userAccess = await prisma.userAccess.findUnique({
          where: { userId: token.sub }
        });

        session.user.id = token.sub;
        session.user.roleId = token.roleId as string;
        session.user.role = (await prisma.role.findUnique({
          where: { id: token.roleId as string },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        }))?.roleName || '';
        session.user.access = {
          menuAccess: (userAccess?.menuAccess as unknown as MenuAccess) || {
            timeline: false,
            workspace: false,
            projectPlanning: false,
            budgetPlanning: false,
            userManagement: false,
            workspaceManagement: false,
            documents: false
          },
          activityAccess: (userAccess?.activityAccess as unknown as ActivityAccess) || {
            createProject: false,
            editProject: false,
            deleteProject: false,
            createBudget: false,
            editBudget: false,
            deleteBudget: false,
            createWorkDivision: false,
            editWorkDivision: false,
            deleteWorkDivision: false,
            createRole: false,
            editRole: false,
            deleteRole: false,
            createVendor: false,
            editVendor: false,
            deleteVendor: false,
            createApprovalSchema: false,
            editApprovalSchema: false,
            deleteApprovalSchema: false,
            createUser: false,
            editUser: false,
            deleteUser: false,
            changePassword: false,
            changeOtherUserPassword: false,
            manageUserAccess: false,
            createDocument: false,
            uploadDocument: false,
            deleteDocument: false,
            downloadDocument: false,
            generateCertificate: false
          },
          workspaceAccess: (userAccess?.workspaceAccess as unknown as WorkspaceAccess) || {
            createPurchaseRequest: false,
            viewPurchaseRequest: false,
            editPurchaseRequest: false,
            reviewApprovePurchaseRequest: false,
            viewOthersPurchaseRequest: false,
            viewOtherDivisionPurchaseRequest: false,
            createPurchaseOrder: false,
            viewPurchaseOrder: false,
            viewOthersPurchaseOrder: false,
            viewOtherDivisionPurchaseOrder: false,
            generatePurchaseOrderDocument: false,
            signDocument: false,
          }
        };
      }
      return session;
    },
    async redirect(
      // TODO: if have landing config, to whatever page it is configurated to land
      // { url, baseUrl }: { url: string; baseUrl: string }
    ) {
      return '/workspace';
    }
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: true, // Enable debug mode
};