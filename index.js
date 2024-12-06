const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Configura il middleware per interpretare JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connessione al database SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Errore nella connessione al database:', err.message);
    } else {
        console.log('Connesso al database SQLite.');
    }
});

// Crea la tabella delle squadre
db.run(`CREATE TABLE IF NOT EXISTS squadre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teamName TEXT,
    players INTEGER,
    notPlaying INTEGER,
    penaltyTotal INTEGER,
    points INTEGER
)`);

// Crea la tabella dei punteggi
db.run(`CREATE TABLE IF NOT EXISTS punteggi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    squadra1 TEXT,
    punteggio1 INTEGER,
    squadra2 TEXT,
    punteggio2 INTEGER
)`);

// Endpoint per ottenere tutte le squadre
app.get('/api/squadre', (req, res) => {
    const query = 'SELECT * FROM squadre';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero delle squadre.' });
        }
        res.json({ teams: rows });
    });
});

// Endpoint per aggiungere una squadra
app.post('/api/squadre', (req, res) => {
    const { teamName, players, notPlaying, penaltyTotal, points } = req.body;

    if (!teamName || !players || players < 6) {
        return res.status(400).json({ error: 'Dati non validi. Il nome della squadra e almeno 6 giocatori sono richiesti.' });
    }

    const query = `INSERT INTO squadre (teamName, players, notPlaying, penaltyTotal, points) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [teamName, players, notPlaying, penaltyTotal, points], function (err) {
        if (err) {
            console.error('Errore durante l\'inserimento della squadra:', err.message);
            return res.status(500).json({ error: 'Errore nell\'inserimento della squadra.' });
        }
        res.status(201).json({ message: 'Squadra aggiunta con successo!', id: this.lastID });
    });
});

// Endpoint per eliminare una squadra
app.delete('/api/squadre/:id', (req, res) => {
    const teamId = req.params.id;

    const query = 'DELETE FROM squadre WHERE id = ?';
    db.run(query, [teamId], function (err) {
        if (err) {
            console.error('Errore durante l\'eliminazione della squadra:', err.message);
            return res.status(500).json({ error: 'Errore durante l\'eliminazione della squadra.' });
        }
        res.json({ message: 'Squadra eliminata con successo!' });
    });
});

// Endpoint per aggiornare i punti di una squadra
app.put('/api/squadre/:id/punti', (req, res) => {
    const teamId = req.params.id;
    const { points } = req.body;

    if (points < 0) {
        return res.status(400).json({ error: 'I punti non possono essere negativi.' });
    }

    const query = 'UPDATE squadre SET points = ? WHERE id = ?';
    db.run(query, [points, teamId], function (err) {
        if (err) {
            console.error('Errore durante l\'aggiornamento dei punti:', err.message);
            return res.status(500).json({ error: 'Errore durante l\'aggiornamento dei punti.' });
        }
        res.json({ message: 'Punti aggiornati con successo!' });
    });
});

// Servire file statici (frontend)
app.use(express.static('public'));


// Avvia il server sulla porta 3000
app.listen(3000, () => {
  console.log('Server in esecuzione su http://localhost:3000');
});