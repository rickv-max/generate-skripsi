// netlify/functions/generate-thesis.js
// Pastikan Anda telah menginstal 'node-fetch' di direktori netlify/functions:
// cd netlify/functions
// npm install node-fetch

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Ambil kunci API dari environment variable Netlify
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY not configured in Netlify Environment Variables.");
        return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error: API Key not found.' }) };
    }

    let prompt;
    try {
        // Parse body permintaan dari frontend
        const body = JSON.parse(event.body);
        prompt = body.prompt;
        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt in request body.' }) };
        }
    } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON in request body.' }) };
    }

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        // Periksa struktur respons dari Gemini API
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const generatedText = result.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ text: generatedText }) // Kirim teks kembali ke frontend
            };
        } else if (result.error) {
            console.error("Gemini API Error Response:", result.error.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Gemini API Error: ${result.error.message}` })
            };
        } else {
            console.error("Unexpected Gemini API response structure:", result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unexpected response from Gemini API.' })
            };
        }
    } catch (error) {
        console.error("Error fetching from Gemini API in function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to connect to Gemini API: ${error.message}` })
        };
    }
};
