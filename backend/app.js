import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { executeCode, getSupportedLanguages } from './codeExecutor.js';

const app = express();

// Security: Rate limiting for code execution
const executionLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests per minute
    message: {
        success: false,
        error: 'Too many code execution requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public'));

// CORS configuration - restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Code Editor API',
        version: '2.0.0',
        endpoints: {
            execute: 'POST /api/execute',
            languages: 'GET /api/languages',
        },
    });
});

// Get supported languages
app.get('/api/languages', (req, res) => {
    try {
        const languages = getSupportedLanguages();
        res.status(200).json({
            success: true,
            languages,
            count: languages.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch supported languages',
        });
    }
});

// Execute code endpoint with rate limiting
app.post('/api/execute', executionLimiter, async (req, res) => {
    try {
        const { code, language } = req.body;

        // Validation
        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Code is required and must be a string',
            });
        }

        if (!language || typeof language !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Language is required and must be a string',
            });
        }

        // Check code length
        const maxLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
        if (code.length > maxLength) {
            return res.status(400).json({
                success: false,
                error: `Code exceeds maximum length of ${maxLength} characters`,
            });
        }

        // Execute code
        const result = await executeCode(code, language);

        res.status(200).json(result);

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during code execution',
            output: '',
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

export default app;
