import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";
import { registerSchema } from "@/lib/validations/auth";

const registerRequestSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Username can only contain letters, numbers, underscores, and hyphens"
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long"
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = registerRequestSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: username, // Use username as default name
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 