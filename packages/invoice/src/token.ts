import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.INVOICE_JWT_SECRET || "your-secret-key";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(id: string): Promise<string> {
  const token = await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);

  return token;
}

export async function verify(token: string): Promise<{ id: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string };
  } catch (error) {
    throw new Error("Invalid token");
  }
}