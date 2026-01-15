import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import { User, IUser } from "../models/User";
import { TransactionLog } from "../models/TransactionLog";

const SESSION_COOKIE = "pc_session";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");

  const hmac = crypto.createHmac("sha256", secret).update(token).digest("hex");
  const sessionValue = `${userId}:${token}:${hmac}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return sessionValue;
}

export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  const [userId, token, providedHmac] = cookie.split(":");
  const secret = process.env.SESSION_SECRET;
  if (!secret || !userId || !token || !providedHmac) return null;

  const expectedHmac = crypto.createHmac("sha256", secret).update(token).digest("hex");
  if (expectedHmac !== providedHmac) return null;

  await connectDB();
  const user = await User.findById(userId).lean<IUser>().exec();
  return user ?? null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireRole(roles: ("member" | "super")[]) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  if (user.role === "member" && !user.approved) return null;
  return user;
}

export async function logTransaction(input: {
  type: string;
  itemId?: string;
  requestId?: string;
  userId?: string;
  meta?: Record<string, unknown>;
}) {
  await connectDB();
  await TransactionLog.create({
    type: input.type,
    item: input.itemId,
    request: input.requestId,
    user: input.userId,
    meta: input.meta,
  });
}
