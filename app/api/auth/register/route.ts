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
    console.log("Registration request received");
    const body = await request.json();
    console.log("Request body parsed successfully");
    
    const { username, email, password } = registerRequestSchema.parse(body);
    console.log("Request validation passed");

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });
    console.log("Existing user check completed");

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
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);
    console.log("Password hashed successfully");

    // Create the user
    console.log("Creating user in database...");
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: username, // Use username as default name
      },
    });
    console.log("User created successfully");

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

    // Check for specific database errors
    if (error instanceof Error) {
      // Prisma errors
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json(
          { error: "Username or email already exists" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("Database connection")) {
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 500 }
        );
      }
      
      // Log the specific error for debugging
      console.error("Specific registration error:", error.message);
    }

    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 