// netlify/functions/generate-thesis.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') { return { statusCode: 405, body: 'Method Not Allowed' }; }
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) { return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY tidak ditemukan.' }) }; }
  try {
    const { topic, problem, chapter } = JSON.parse(event.body);
    if (!topic || !problem || !chapter) { return { statusCode: 400, body: JSON.stringify({ error: 'Data tidak lengkap.' }) }; }
    const prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia...`; // Prompt lengkap Anda
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: { "temperature": 1, "topK": 0, "topP": 0.95, "maxOutputTokens": 8192, "stopSequences": [] }
    };
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
    const apiResponse = await fetch(apiURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    const responseData = await apiResponse.json();
    if (responseData.candidates && responseData.candidates[0].content?.parts) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return { statusCode: 200, body: JSON.stringify({ text: generatedText }) };
    } else {
      const reason = responseData.promptFeedback?.blockReason || responseData.candidates?.[0]?.finishReason || 'Unknown reason';
      throw new Error(`Gemini tidak menghasilkan konten. Alasan: ${reason}`);
    }
  } catch (error) {
    console.error('Terjadi error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
