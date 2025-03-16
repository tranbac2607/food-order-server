import { Request, Response, NextFunction } from 'express';
import { formatResponse } from '../utils/format-response';

// Middleware format response trước khi gửi về client
export const responseFormatter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json;

  res.json = function (data) {
    const formattedData = formatResponse(data);
    return originalJson.call(this, formattedData);
  };

  next();
};
