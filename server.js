import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'tasks.json');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/tasks', async (_req, res) => {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf-8');
        const tasks = JSON.parse(raw);
        res.json(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(DATA_FILE, '[]', 'utf-8');
            res.json([]);
            return;
        }

        console.error('Error reading tasks.json:', error);
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

app.put('/api/tasks', async (req, res) => {
    try {
        const tasks = Array.isArray(req.body) ? req.body : [];
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error writing tasks.json:', error);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
