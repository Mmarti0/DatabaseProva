const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Errore nella connessione al database:', err.message);
    } else {
        console.log('Connesso al database SQLite.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS squadre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teamName TEXT,
    players INTEGER,
    notPlaying INTEGER,
    penaltyTotal INTEGER,
    points INTEGER
)`);

app.get('/', (req, res) => {
    res.send('Server in esecuzione correttamente!');
});

app.get('/api/squadre', (req, res) => {
    db.all('SELECT * FROM squadre', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero delle squadre.' });
        }
        res.json({ teams: rows });
    });
});

app.post('/api/squadre', (req, res) => {
    const { teamName, players, notPlaying, penaltyTotal, points } = req.body;
    if (!teamName || !players || players < 6) {
        return res.status(400).json({ error: 'Dati non validi.' });
    }
    db.run('INSERT INTO squadre (teamName, players, notPlaying, penaltyTotal, points) VALUES (?, ?, ?, ?, ?)',
        [teamName, players, notPlaying, penaltyTotal, points],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Errore nell\'aggiunta della squadra.' });
            }
            res.status(201).json({ id: this.lastID });
        });
});

app.put('/api/squadre/:id/punti', (req, res) => {
    const { points } = req.body;
    const { id } = req.params;
    db.run('UPDATE squadre SET points = ? WHERE id = ?', [points, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Errore nell\'aggiornamento dei punti.' });
        }
        res.status(200).json({ message: 'Punti aggiornati.' });
    });
});

app.delete('/api/squadre/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM squadre WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Errore nell\'eliminazione della squadra.' });
        }
        res.status(200).json({ message: 'Squadra eliminata.' });
    });
});

app.delete('/api/squadre', (req, res) => {
    db.run('DELETE FROM squadre', [], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Errore nell\'eliminazione delle squadre.' });
        }
        res.status(200).json({ message: 'Tutte le squadre eliminate.' });
    });
});


// Avvia il server sulla porta 3000
app.listen(3000, () => {
  console.log('Server in esecuzione su http://localhost:3000');
});