import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	const { pathname } = new URL(request.url);

	// If authenticated user hits root, send them straight to vocabulary
	if (session && pathname === "/") {
		return NextResponse.redirect(new URL("/vocabulary", request.url));
	}
 
	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/", "/vocabulary/:path*"], // Protect root and vocabulary (admin has its own auth)
};