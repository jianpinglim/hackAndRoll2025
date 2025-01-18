import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import pool from'./db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

export { httpServer, io };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.post('/api/combinations/combine', 
    async (req, res, next) => {
        console.log("I am at 1st stage")
        const { element1, element2 } = req.body;
        const query = `
                SELECT result, emoji
                FROM word_cache
                WHERE 
                  (first_word = $1 AND second_word = $2)
                  OR (first_word = $2 AND second_word = $1)
                LIMIT 1;
            `;
            const values = [element1, element2];
            const result = await pool.query(query, values);

            if (result.rows.length > 0) {
                res.json(result.rows[0]) // Return result and emoji
            } else {
                res.locals.element1 = element1;
                res.locals.element2 = element2;
                next() // No match found
            }
    },
    async (req, res, next) => {
         const element1 = res.locals.element1;
         const element2 = res.locals.element2;
         console.log("I am at AI")
        
        if (!element1 || !element2) {
            return res.status(400).json({
                success: false,
                result: null,
                error: 'Missing elements'
            });
        }
    
        try {
            // First get the word combination
            const wordCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: `You are a helpful assistant that helps people to craft new things by combining two words into a new word. 
                    The most important rules that you have to follow with every single answer that you are not allowed to use the words ${element1} and ${element2} as part of your answer and that you are only allowed to answer with one thing.
                    DO NOT INCLUDE THE WORDS ${element1} and ${element2} as part of the answer! The words ${element1} and ${element2} may NOT be part of the answer.
                    No sentences, no phrases, no multiple words, no punctuation, no special characters, no numbers, no emojis, no URLs, no code, no commands, no programming.
                    The answer has to be a noun.
                    The order of the both words does not matter, both are equally important.
                    The answer has to be related to both words and the context of the words.
                    The answer can either be a combination of the words or the role of one word in relation to the other.
                    Answers can be things, materials, people, companies, animals, occupations, food, places, objects, emotions, events, concepts, natural phenomena, body parts, vehicles, sports, clothing, furniture, technology, buildings, technology, instruments, beverages, plants, academic subjects and everything else you can think of that is a noun.
                    Never reply with im sorry there it can be the most random thing ever that might slightly make sense. the word generated should be easy enough to understand and not be too abstract. A 15 year old should understand`
                }, {
                    role: "user",
                    content: `Reply with the result of what would happen if you combine ${element1} and ${element2}. The answer has to be related to both words and the context of the words and may not contain the words themselves.`
                }],
                temperature: 0.7,
                max_tokens: 50
            });
    
            const word = wordCompletion.choices[0].message.content.trim().split(/\s+/)[0];
    
            // Then get the emoji for that word
            const emojiCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: 'Reply with one emoji the word. Use the UTF-8 encoding.'
                }, {
                    role: "user",
                    content: `Give one emoji for: ${word}`
                }],
                temperature: 0.7,
                max_tokens: 50
            });
    
            const emoji = emojiCompletion.choices[0].message.content.trim();
            res.locals.result = word;
            res.locals.emoji = emoji;
            next();
            // res.json({ 
            //     success: true, 
            //     result: word,
            //     emoji: emoji
            // });
    
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({
                success: false,
                result: `${element1}${element2}`,
                emoji: '❓',
                error: error.message
            });
        }
    }, 
    async (req, res, next) => {
        console.log("I am at 3rd stage")
        const { element1, element2, result, emoji } = res.locals;

        try {
            const query = `
                INSERT INTO word_cache (first_word, second_word, result, emoji)
                VALUES ($1, $2, $3, $4);
            `;
            const values = [element1, element2, result, emoji];
            await pool.query(query, values);
            console.log('Combination added to database successfully');
            next();
        } catch (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save combination to database',
            });
        }
    },
    (req, res) => {
        console.log("I am at 4th stage")
        res.json({ 
            success: true, 
            result: res.locals.result,
            emoji: res.locals.emoji,
        });
    }
);

app.post('/api/battle', async (req, res) => {
    const { playerElement, opponentElement, mode } = req.body;

    const prompts = {
        funny: "You are a funny battle commentator. Generate a humorous battle result with silly puns and jokes. Keep it light and family-friendly.",
        brainrot: "You are a chaotic battle commentator. Generate absolutely nonsensical battle results with random internet memes and absurd logic and brainrot.",
        racist: "You are an Racist against asians battle commentator. Generate dark humor battle results with controversial stereotypes against asians and edgy jokes."
    };

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: prompts[mode] || prompts.funny
            }, {
                role: "user",
                content: `Who would win in a battle between ${playerElement} and ${opponentElement}? Provide the winner and a reason in 2 lines max.`
            }],
            temperature: 0.8,
            max_tokens: 100
        });

        const response = completion.choices[0].message.content;
        const [winner, ...reasonParts] = response.split(':');
        
        res.json({
            winner: winner.trim(),
            reason: reasonParts.join(':').trim()
        });
    } catch (error) {
        console.error('Battle API Error:', error);
        res.status(500).json({ error: 'Battle calculation failed' });
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle room creation
    socket.on('createRoom', () => {
        let roomCode;
        do {
            roomCode = generateRoomCode();
        } while (rooms.has(roomCode));

        rooms.set(roomCode, {
            players: [socket.id],
            selections: {}
        });

        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode });
    });

    // Handle room joining
    socket.on('joinRoom', (roomCode) => {
        const room = rooms.get(roomCode);
        
        if (!room) {
            socket.emit('joinError', { message: 'Room not found!' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('joinError', { message: 'Room is full!' });
            return;
        }

        room.players.push(socket.id);
        socket.join(roomCode);

        // Send champions list to both players and start game
        io.to(roomCode).emit('championList', champions);
        io.to(roomCode).emit('gameStart', { roomCode });
    });
});

// Serve static files
app.use(express.static('public'));

// Game state
const rooms = new Map();

// Generate random room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle room creation
  socket.on('createRoom', () => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms.has(roomCode));

    rooms.set(roomCode, {
      players: [socket.id],
      selections: {}
    });

    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode });
  });

  // Handle room joining
  socket.on('joinRoom', (roomCode) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('joinError', { message: 'Room not found!' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('joinError', { message: 'Room is full!' });
      return;
    }

    room.players.push(socket.id);
    socket.join(roomCode);

    // Send champions list to both players and start game
    io.to(roomCode).emit('championList', champions);
    io.to(roomCode).emit('gameStart', { roomCode });
  });

  // Handle champion selection
  socket.on('selectChampion', ({ championId, roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.selections[socket.id] = champions.find(c => c.id === championId);

    // If both players have selected, show results
    if (Object.keys(room.selections).length === 2) {
        io.to(roomCode).emit('battleResult', {
            selections: room.selections
        });

        // Clean up room after battle
        setTimeout(() => {
            rooms.delete(roomCode);
            io.to(roomCode).emit('returnHome');
        }, 3000);
    }
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up rooms when players disconnect
    for (const [roomCode, room] of rooms.entries()) {
      if (room.players.includes(socket.id)) {
        rooms.delete(roomCode);
        io.to(roomCode).emit('playerLeft');
      }
    }
  });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});