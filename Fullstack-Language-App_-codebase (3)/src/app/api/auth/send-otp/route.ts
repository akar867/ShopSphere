import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { eq } from "drizzle-orm";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await db
      .delete(verification)
      .where(eq(verification.identifier, `otp:${email}`));

    // Store OTP in verification table
    await db.insert(verification).values({
      id: `otp_${Date.now()}_${Math.random()}`,
      identifier: `otp:${email}`,
      value: otp,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Mini Mandarin - Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #111827; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for registering with Mini Mandarin! Please use the following One-Time Password (OTP) to complete your registration:
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #111827; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
              This OTP will expire in 10 minutes.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Mini Mandarin - Learn Chinese, One Character at a Time
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}