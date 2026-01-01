import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecords = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, `otp:${email}`),
          gt(verification.expiresAt, new Date())
        )
      );

    if (otpRecords.length === 0) {
      return NextResponse.json(
        { error: "OTP expired or not found" },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // Verify OTP
    if (otpRecord.value !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Delete the used OTP
    await db
      .delete(verification)
      .where(eq(verification.identifier, `otp:${email}`));

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}