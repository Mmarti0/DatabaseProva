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

// Crea la tabella dei punteggi
db.run(`CREATE TABLE IF NOT EXISTS punteggi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  squadra1 TEXT,
  punteggio1 INTEGER,
  squadra2 TEXT,
  punteggio2 INTEGER
)`);

app.post('/inserisci-punteggio', (req, res) => {
    const { squadra1, punteggio1, squadra2, punteggio2 } = req.body;
    
    const query = `INSERT INTO punteggi (squadra1, punteggio1, squadra2, punteggio2) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [squadra1, punteggio1, squadra2, punteggio2], function (err) {
      if (err) {
        console.error('Errore durante l\'inserimento dei dati:', err.message);
        return res.status(500).json({ error: 'Errore nell\'inserimento dei dati' });
      }
      res.status(200).json({ success: 'Punteggio inserito con successo', id: this.lastID });
    });
  });
  
// Prova collegamento con il frontend (Endpoint)

// Servire file statici (frontend)
app.use(express.static('public'));
 
  // Aggiungere una squadra

app.post('/api/squadre', async (req, res) => {
  const { teamName, players, notPlaying, penaltyTotal, points } = req.body;

  if (!teamName || !players || players < 6) {
      return res.status(400).json({ error: 'Dati non validi. Il nome della squadra e almeno 6 giocatori sono richiesti.' });
  }

  try {
      // Inserire la logica per salvare la squadra nel database
      res.status(201).json({ message: 'Squadra aggiunta con successo!' });
  } catch (error) {
      res.status(500).json({ error: 'Errore nel salvataggio della squadra.' });
  }
});

 // Elimina una squadra 

 app.delete('/api/squadre/:id', async (req, res) => {
  const teamId = req.params.id;

  try {
      // Logica per eliminare la squadra dal database
      res.json({ message: 'Squadra eliminata con successo!' });
  } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione della squadra.' });
  }
});

 //Modificare punti di una squadra 

 app.put('/api/squadre/:id/punti', async (req, res) => {
  const teamId = req.params.id;
  const { points } = req.body;

  if (points < 0) {
      return res.status(400).json({ error: 'I punti non possono essere negativi.' });
  }

  try {
      // Logica per aggiornare i punti della squadra nel database
      res.json({ message: 'Punti aggiornati con successo!' });
  } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'aggiornamento dei punti.' });
  }
});

 //Ottenere tutte le squadre 

 app.get('/api/squadre', async (req, res) => {
  try {
      // Logica per recuperare tutte le squadre dal database
      res.json({ teams: [] }); // Sostituisci [] con i dati reali
  } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero delle squadre.' });
  }
});


  // Avvia il server sulla porta 3000
app.listen(3000, () => {
  console.log('Server in esecuzione su http://localhost:3000');
});
