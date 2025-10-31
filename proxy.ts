import { SignJWT } from "jose";
import { v4 } from 'uuid';
import { NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: '/',
}

export async function proxy(request: NextRequest) {
	const cookies = request.cookies;
	const response = NextResponse.next();
	if (!cookies.get("paragonToken")) {
		response.cookies.set("paragonToken",
			await paragonSessionToken(v4()),
			{
				httpOnly: true,
				secure: true,
				path: "/",
				sameSite: "lax",
				expires: new Date(Date.now() + (23 * 60 * 60 * 1000)),
			})
	}
	return response;
}

export async function paragonSessionToken(sessionToken: string): Promise<string> {
	const PRIVATE_KEY = await importPrivateKey(process.env.PARAGON_SIGNING_KEY!);

	try {
		const paragonUserToken = await new SignJWT({
			sub: sessionToken,
		})
			.setProtectedHeader({ alg: "RS256" })
			.setIssuedAt()
			.setExpirationTime("24h")
			.sign(PRIVATE_KEY);

		return paragonUserToken;
	} catch (err) {
		console.error("Paragon signing error", err);
	}
	return "";
}


/*
  Import a PEM encoded RSA private key, to use for RSA-PSS signing.
  Takes a string containing the PEM encoded key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
async function importPrivateKey(pem: string) {
	// Replace encoded newlines with actual newlines
	pem = pem.replace(/\\n/g, "\n");

	// Normalize newlines to '\n'
	pem = pem.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	// Remove unnecessary whitespace and ensure proper PEM format
	pem = pem.trim();

	const pemHeader = "-----BEGIN PRIVATE KEY-----";
	const pemFooter = "-----END PRIVATE KEY-----";

	if (!pem.startsWith(pemHeader) || !pem.endsWith(pemFooter)) {
		throw new Error("PEM format is incorrect.");
	}

	// Fetch the part of the PEM string between header and footer
	const pemContents = pem
		.substring(pemHeader.length, pem.length - pemFooter.length)
		.replace(/[\s\n]+/g, ""); // Remove all whitespace and newline characters

	// Base64 decode the string to get the binary data
	const binaryDerString = Buffer.from(pemContents, "base64");

	try {
		return await globalThis.crypto.subtle.importKey(
			"pkcs8",
			binaryDerString,
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256",
			},
			true,
			["sign"]
		);
	} catch (err) {
		console.warn(
			"Could not import signing key, it may be in an invalid format."
		);
		throw err;
	}
}
