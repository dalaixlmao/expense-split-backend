import { Request, Response, NextFunction } from "express";
import { PaginationParams } from "../types";

/**
 * Middleware to parse and validate pagination parameters
 * 
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = (req.query.sortOrder as string || 'desc').toLowerCase();
    
    // Validate parameters
    if (page < 1) {
      res.status(400).json({ message: "Page must be greater than 0" });
      return;
    }
    
    if (limit < 1 || limit > 100) {
      res.status(400).json({ message: "Limit must be between 1 and 100" });
      return;
    }
    
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      res.status(400).json({ message: "Sort order must be 'asc' or 'desc'" });
      return;
    }
    
    // Add validated pagination parameters to the request object
    req.query.pagination = {
      page,
      limit,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    } as unknown as string;
    
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid pagination parameters" });
  }
};

/**
 * Helper function to apply pagination to database queries
 * 
 * @param params Pagination parameters
 * @returns Prisma compatible skip/take/orderBy object
 */
export const getPaginationOptions = (params: PaginationParams) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  return {
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
};

/**
 * Helper function to format paginated response
 * 
 * @param data Array of items
 * @param total Total count of items
 * @param params Pagination parameters
 * @returns Formatted paginated response
 */
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
) => {
  const { page = 1, limit = 10 } = params;
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};