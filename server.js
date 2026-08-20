import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: 'supabase' });
});

app.listen(PORT, () => {
    console.log(`Health server running on http://localhost:${PORT}`);
});
