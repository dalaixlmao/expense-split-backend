import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        res.status(401).json({ message: "Not authorized, user not found" });
      }
      if(user)
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
