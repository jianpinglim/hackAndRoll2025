import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.post('/api/combinations/combine', async (req, res) => {
    const { element1, element2 } = req.body;
    
    if (!element1 || !element2) {
        return res.status(400).json({
            success: false,
            result: null,
            error: 'Missing elements'
        });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: `You are a helpful assistant that helps people to craft new things by combining two words into a new word. The most important rules that you have to follow with every single answer are:
                1. You are not allowed to use the words "${element1}" and "${element2}" as part of your answer.
                2. Your answer must only consist of one thing.
                3. DO NOT include the words "${element1}" and "${element2}" in any form.
                4. The result should relate directly to both words given in the prompt.
                5. The answer can be anything – a thing, material, person, object, animal, place, event, food, plant, etc.
                6. The result must be a noun and NOT a sentence or phrase.
                7. Please provide a noun (a single word) that combines the two given words.
                
                Now, combine the following two words: "${element1}" and "${element2}", and provide the result.`
            }],
            temperature: 0.7,
            max_tokens: 50
        });

        const result = completion.choices[0].message.content.trim().split(/\s+/)[0];
        res.json({ success: true, result });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            result: `${element1}${element2}`,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});