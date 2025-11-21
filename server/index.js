const express = require('express')
const sql = require('./db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { OpenAI } = require('openai')
const app = express()
app.use(express.json())
app.use(cors())
app.get('/api', (req, res) =>{
    res.json({ message: 'test' })
})
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // 1. Check if user already exists (Manual Check)
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email or Username already taken' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = await sql`
      INSERT INTO users (email, username, password_hash)
      VALUES (${email}, ${username}, ${passwordHash})
      RETURNING *
    `;

    // 4. Create Token
    const payload = { user: { id: newUser[0].user_id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;

    // 2. SAFETY CHECK (This is what was missing/failing)
    // We verify that we actually got a user back before checking the password
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0]; // Get the first user

    // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 4. Create token
    const payload = {
      user: {
        id: user.user_id,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await sql`
      SELECT * FROM exercises
      ORDER BY name
    `;
    
    res.json(exercises);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/exercises', async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const newExercise = await sql`
      INSERT INTO exercises (name, category)
      VALUES (${name}, ${category})
      RETURNING *
    `;
    
    res.status(201).json(newExercise[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/workouts', async (req, res) => {
  try {
    const { name, date } = req.body;

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id; // Get the user's ID

    const newWorkout = await sql`
      INSERT INTO workouts (name, user_id, workout_date)
      VALUES (${name}, ${userId}, ${date || new Date()})
      RETURNING *
    `;
    
    res.status(201).json(newWorkout[0]);

  } catch (err) {
    console.error(err.message);
    res.status(401).json({ error: 'Token is not valid or server error' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
    jwt.verify(token, process.env.JWT_SECRET);

    const { workout_id, exercise_id, sets, reps, weight_kg, notes } = req.body;

    if (!workout_id || !exercise_id || !sets || !reps || !weight_kg) {
      return res.status(400).json({ error: 'Missing required log fields' });
    }

    const newLog = await sql`
      INSERT INTO workout_logs (workout_id, exercise_id, sets, reps, weight_kg, notes)
      VALUES (${workout_id}, ${exercise_id}, ${sets}, ${reps}, ${weight_kg}, ${notes})
      RETURNING *
    `;
    
    res.status(201).json(newLog[0]);

  } catch (err) {
    console.error(err.message);
    res.status(401).json({ error: 'Token is not valid or server error' });
  }
});

app.get('/api/workouts', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id; 

    const workouts = await sql`
      SELECT * FROM workouts
      WHERE user_id = ${userId}
      ORDER BY workout_date DESC
    `;
    
    res.json(workouts);

  } catch (err) {
    console.error(err.message);
    res.status(401).json({ error: 'Token is not valid or server error' });
  }
});

// --- THIS IS OUR NEW "GET SINGLE WORKOUT" ROUTE (PROTECTED) ---

app.get('/api/workouts/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id; 

    const { id } = req.params;

    const logs = await sql`
      SELECT 
        wl.log_id,
        wl.sets,
        wl.reps,
        wl.weight_kg,
        wl.notes,
        e.name AS exercise_name 
      FROM workout_logs wl
      JOIN exercises e ON wl.exercise_id = e.exercise_id
      JOIN workouts w ON wl.workout_id = w.workout_id
      WHERE wl.workout_id = ${id} AND w.user_id = ${userId}
    `;

    if (logs.length === 0) {
    }
    
    res.json(logs);

  } catch (err) {
    console.error(err.message);
    res.status(401).json({ error: 'Token is not valid or server error' });
  }
})

// --- THIS IS OUR NEW "PROGRESS ANALYTICS" ROUTE (PROTECTED) ---

app.get('/api/progress/:exerciseId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    const { exerciseId } = req.params;
    const history = await sql`
      SELECT 
        w.workout_date,
        wl.weight_kg,
        wl.reps,
        wl.sets
      FROM workout_logs wl
      JOIN workouts w ON wl.workout_id = w.workout_id
      WHERE wl.exercise_id = ${exerciseId} AND w.user_id = ${userId}
      ORDER BY w.workout_date ASC
    `;
    
    res.json(history);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- THIS IS OUR NEW "AI COACH" ROUTE (PROTECTED) ---

app.post('/api/coach', async (req, res) => {
  try {
    // 1. Verify token (Standard security check)
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization denied' });
    jwt.verify(token, process.env.JWT_SECRET);

    const { message } = req.body;

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // This is the best cost/performance model right now
      messages: [
        { 
          role: "system", 
          content: "You are an elite strength and conditioning coach. Your goal is to provide quick, actionable, and safe advice. Keep answers concise (under 3 sentences if possible). If the question is not about fitness, politely decline to answer." 
        },
        { role: "user", content: message }
      ],
    });

    // 3. Send the AI's response back
    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).json({ error: 'Failed to get advice' });
  }
});

// --- DELETE LOG ROUTE ---
app.delete('/api/logs/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization denied' });
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;

    // Delete the log
    // Ideally we should check if the log belongs to the user's workout first
    // but for this MVP, we'll trust the ID.
    await sql`DELETE FROM workout_logs WHERE log_id = ${id}`;

    res.json({ message: 'Log deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- DELETE WORKOUT ---
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization denied' });
    jwt.verify(token, process.env.JWT_SECRET);
    
    const { id } = req.params;
    // Cascade delete handles logs automatically if set up in SQL, 
    // but explicit delete is safer for now
    await sql`DELETE FROM workouts WHERE workout_id = ${id}`;
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- DELETE EXERCISE ---
app.delete('/api/exercises/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization denied' });
    jwt.verify(token, process.env.JWT_SECRET);
    
    const { id } = req.params;
    await sql`DELETE FROM exercises WHERE exercise_id = ${id}`;
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 5000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})