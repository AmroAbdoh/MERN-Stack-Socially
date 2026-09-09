import { Request, Response, NextFunction } from "express";

import { UnauthenticatedError } from "../errors";
import { verifyJWT } from "../utils/jwt";

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new UnauthenticatedError("Authentication invalid"));
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new UnauthenticatedError("Authentication invalid"));
    return;
  }

  try {
    req.user = verifyJWT(token);
    next();
  } catch {
    next(new UnauthenticatedError("Authentication invalid"));
  }
};
