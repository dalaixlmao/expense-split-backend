import { Request, Response, NextFunction } from "express";
import { CreateExpenseDTO } from "../types";
import { CreateExpenseDTOSchema } from "../types/zodSchemas";

export const addExpenseVlidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: CreateExpenseDTO = req.body;
  try {
    const validate = CreateExpenseDTOSchema.safeParse(body);
    if (validate.success) {
      next();
    } else {
      res
        .status(400)
        .json({ message: "Bad input request, can't create Expense." });
    }
  } catch (e) {
    res
      .status(400)
      .json({ message: "Bad input request, can't create Expense." });
  }
};

// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
//     const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
//     if (!user) {
//       return res.status(401).json({ message: 'Not authorized, user not found' });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };


// export class UserController {
//   constructor(private userService: UserService) {}

//   async createUser(req: Request, res: Response) {
//     try {
//       const userData: CreateUserDTO = req.body;
//       const user = await this.userService.createUser(userData);
//       res.status(201).json(user);
//     } catch (error) {
//       res.status(400).json({ message: 'Failed to create user', error });
//     }
//   }

//   async getUserDetails(req: Request, res: Response) {
//     try {
//       const userId = req.params.id;
//       const user = await this.userService.getUserById(userId);
//       res.json(user);
//     } catch (error) {
//       res.status(404).json({ message: 'User not found', error });
//     }
//   }
// }