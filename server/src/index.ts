import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
// CORS configuration
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const envOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const corsOrigin = [...defaultOrigins, ...envOrigin];

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        corsOrigin
    });

    // Initialize Contract Service Listeners
    import('./services/contract.service').then(({ default: contractService }) => {
        contractService.listenForMarketEvents();
        contractService.listenForProjectEvents();
        contractService.listenForCreditMints((to, amount, projectId) => {
            Logger.info('Credit Minted', { to, amount: amount.toString(), projectId: projectId.toString() });
        });
        Logger.info('Contract Service listeners started');
    }).catch(err => {
        Logger.error('Failed to start Contract Service listeners', err);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        Logger.error('Unhandled Rejection', { reason, promise });
        // In production, you might want to exit the process
        // process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
        Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
        // Exit process for uncaught exceptions
        process.exit(1);
    });
});

export default app;
