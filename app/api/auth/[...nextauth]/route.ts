import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const revalidate = 0

const handler = NextAuth(authOptions);

// Mengubah ekspor handler dengan tipe yang benar
export { handler as GET, handler as POST }; 