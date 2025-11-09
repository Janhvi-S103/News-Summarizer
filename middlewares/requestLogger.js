const logger = require('../utils/logging');
const { v4: uuidv4 } = require('uuid');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    req.id = uuidv4();

    // Log request
    logger.info({
        requestId: req.id,
        method: req.method,
        path: req.path,
        userId: req.user?.id || 'anonymous'
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) {
            logger.warn({
                requestId: req.id,
                message: 'Slow request detected',
                duration: `${duration}ms`,
                path: req.path
            });
        }
        
        logger.info({
            requestId: req.id,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};

module.exports = requestLogger;