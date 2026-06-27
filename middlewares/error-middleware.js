const errorMiddleware = (err, req, res, next) => {
    let statusCode = 500;
    let message = err.message || "Internal Server Error";
    
    // Handle CORS errors
    if (err.message && err.message.includes('CORS')) {
        statusCode = 403;
        message = `CORS Error: ${err.message}. Check server logs for origin details.`;
        console.error('CORS Error Details:', {
            origin: req.headers.origin,
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer,
            method: req.method,
            url: req.url
        });
    }
    // Handle multer errors
    else if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = `Unexpected field: ${err.field}`;
        } else {
            message = err.message;
        }
    }
    // Handle validation errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(error => error.message).join(', ');
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    // Handle MongoDB duplicate key errors
    else if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }
    // Handle custom errors that already have status codes
    else if (err.statusCode) {
        statusCode = err.statusCode;
    }
    
    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export default errorMiddleware;