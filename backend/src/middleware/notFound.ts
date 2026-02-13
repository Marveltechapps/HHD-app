import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/ErrorResponse';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ErrorResponse(`Not found - ${req.originalUrl}`, 404);
  next(error);
};
