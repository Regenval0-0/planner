import type { Request, Response, NextFunction, RequestHandler } from 'express';

/** Express 4 не ловит ошибки async-обработчиков — передаём их в общий обработчик ошибок. */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
}
