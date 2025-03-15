import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const revalidate = 0

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    
    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exists) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: '',
        employeeId: '',
        residentId: '',
        nationality: '',
        birthday: new Date(),
        birthplace: '',
        gender: '',
        address: '',
        role: {
          connect: {
            id: '1',
          },
        },
        workDivision: {
          connect: {
            id: '1',
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 