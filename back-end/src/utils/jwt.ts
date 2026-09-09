import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  role: "user" | "admin";
};

const getJWTSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

export const signJWT = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: (process.env.JWT_LIFETIME ||
      "1d") as jwt.SignOptions["expiresIn"],
  });
};

export const verifyJWT = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, getJWTSecret());

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== "user" && decoded.role !== "admin")
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
};
