import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorResponse } from '../utils/ErrorResponse';
import User from '../models/User.model';

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    mobile: string;
    role: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new ErrorResponse('User not found', 404);
      }

      req.user = {
        id: user._id.toString(),
        mobile: user.mobile,
        role: user.role,
      };

      next();
    } catch (error) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new ErrorResponse(
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }

    next();
  };
};
