require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
let port = process.env.PORT || 3000;
const maxPortAttempts = 10; // Try up to 10 different ports

// Detailed logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// CORS configuration - Allow all origins during development
app.use(cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: true
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies with increased limit
app.use(express.json({ limit: '10mb' }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is running!',
        port: port
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        port: port
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: port,
        openai_key_configured: !!process.env.OPENAI_API_KEY
    });
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// API endpoint for generating packing list
app.post('/api/generate-packing-list', async (req, res) => {
    try {
        console.log('Received packing list request:', req.body);

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured');
        }

        const { destination, startDate, endDate, tripType, activities } = req.body;
        
        if (!destination || !startDate || !endDate || !tripType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'Please provide destination, dates, and trip type'
            });
        }

        // Calculate duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        console.log('Calling OpenAI API...');

        // Create prompt for OpenAI
        const prompt = `Generate a detailed packing list for a ${duration}-day ${tripType} trip to ${destination}.
        Additional activities planned: ${activities || 'none specified'}.
        Format the response as a JSON array of strings, each string being a packing item.
        Include essential items based on the trip type and duration.
        Consider weather-appropriate clothing and activity-specific gear.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI travel assistant that helps create personalized packing lists. Your responses should be practical, comprehensive, and specific to the trip details provided."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        console.log('OpenAI API response received');

        // Parse the response
        let packingList;
        try {
            packingList = JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.log('JSON parsing failed, using text fallback');
            // If JSON parsing fails, split by newlines and clean up
            packingList = completion.choices[0].message.content
                .split('\n')
                .map(item => item.replace(/^[-*]\s+/, '').trim())
                .filter(item => item.length > 0);
        }

        res.json({ success: true, data: packingList });
    } catch (error) {
        console.error('Error in generate-packing-list:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate packing list',
            details: error.message 
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: err.message
    });
});

// Function to start server
function startServer(portToUse) {
    return new Promise((resolve, reject) => {
        const server = app.listen(portToUse, '0.0.0.0')
            .on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.log(`Port ${portToUse} is in use, trying next port...`);
                    resolve(false);
                } else {
                    reject(error);
                }
            })
            .on('listening', () => {
                console.log(`Server running on http://localhost:${portToUse}`);
                console.log('Press Ctrl+C to stop');
                port = portToUse; // Update the port variable
                resolve(true);
            });
    });
}

// Try to start server on different ports
async function tryPorts() {
    for (let i = 0; i < maxPortAttempts; i++) {
        const portToTry = 3000 + i;
        try {
            const success = await startServer(portToTry);
            if (success) {
                // Update the frontend to use the correct port
                console.log(`
                =====================================
                Server successfully started on port ${portToTry}
                =====================================
                Please update your frontend code to use this port:
                1. Open script.js
                2. Change all instances of "localhost:3000" to "localhost:${portToTry}"
                =====================================
                `);
                return;
            }
        } catch (error) {
            console.error('Error starting server:', error);
        }
    }
    console.error('Could not find an available port after', maxPortAttempts, 'attempts');
    process.exit(1);
}

// Start the server
tryPorts().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
}); 