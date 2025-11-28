export class Logger {
    private static formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }

    static info(message: string, meta?: any): void {
        console.log(this.formatMessage('INFO', message, meta));
    }

    static warn(message: string, meta?: any): void {
        console.warn(this.formatMessage('WARN', message, meta));
    }

    static error(message: string, meta?: any): void {
        console.error(this.formatMessage('ERROR', message, meta));
    }

    static debug(message: string, meta?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
}

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        Logger.info(`${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
};
