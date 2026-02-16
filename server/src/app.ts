import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { globalErrorHandler } from './common/middleware/error.middleware';
import { AppError } from './errors/AppError';

const app: Application = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
});
app.use(limiter);

app.use('/public', express.static('public'));

app.use('/api/v1', routes);

app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
