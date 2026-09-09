import jwt from "jsonwebtoken";

export type PasswordResetPayload = {
  userId: string;
  purpose: "password-reset";
};

export const createPasswordResetToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId,
      purpose: "password-reset",
    },
    secret,
    {
      expiresIn: "10m",
    },
  );
};

export const verifyPasswordResetToken = (
  token: string,
): PasswordResetPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    decoded.purpose !== "password-reset"
  ) {
    throw new Error("Invalid password reset token");
  }

  return {
    userId: decoded.userId,
    purpose: "password-reset",
  };
};
