// Caricare squadre dal database 
async function loadTeams() {
    try {
        const response = await fetch('/api/squadre');
        if (!response.ok) throw new Error('Errore nel recupero delle squadre.');
        const teams = await response.json();

        const teamsList = document.getElementById('teamsList').querySelector('tbody');
        teamsList.innerHTML = ''; // Pulisce la lista esistente

        teams.forEach((team) => {
            const row = document.createElement('tr');
            const canPlay = (team.players - team.notPlaying) >= 6;
            const playStatus = canPlay 
                ? '<span class="can-play">✅</span>' 
                : '<span class="cannot-play">❌</span>';

            const finalPoints = team.points !== null ? team.points - team.penaltyTotal : 'N/A';

            row.innerHTML = `
                <td>${team.teamName}</td>
                <td>${team.players}</td>
                <td>${team.notPlaying}</td>
                <td>${team.penaltyTotal}</td>
                <td>${playStatus}</td>
                <td>${team.points !== null ? team.points : 'N/A'}</td>
                <td>${canPlay ? finalPoints : 'N/A'}</td>
                <td><button class="deleteBtn" data-id="${team.id}">Elimina</button></td>
            `;
            teamsList.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        alert('Errore nel caricamento delle squadre.');
    }
}

// Aggiungi una squadra al database 
document.getElementById('teamForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const teamName = document.getElementById('teamName').value.trim();
    const players = parseInt(document.getElementById('players').value);
    const notPlaying = parseInt(document.getElementById('notPlaying').value);
    const penaltyTotal = notPlaying * globalPenaltyPerPlayer;

    if (players < 6) {
        alert('Il numero totale di giocatori deve essere almeno 6.');
        return;
    }

    try {
        const response = await fetch('/api/squadre', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamName, players, notPlaying, penaltyTotal, points: null }),
        });

        if (!response.ok) throw new Error('Errore nel salvataggio della squadra.');

        alert('Squadra aggiunta con successo!');
        this.reset();
        loadTeams();
    } catch (error) {
        console.error(error);
        alert('Errore nell\'aggiunta della squadra.');
    }
});

//Elimina una squadra dal database 
document.getElementById('teamsList').addEventListener('click', async function(e) {
    if (e.target.classList.contains('deleteBtn')) {
        const id = e.target.dataset.id;

        try {
            const response = await fetch(`/api/squadre/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Errore nella cancellazione della squadra.');

            alert('Squadra eliminata con successo!');
            loadTeams();
        } catch (error) {
            console.error(error);
            alert('Errore nella cancellazione della squadra.');
        }
    }
});

// Codice del frontend 

// Variabile globale per la penalità per giocatore
let globalPenaltyPerPlayer = 0;

// Funzione per aggiornare la visualizzazione della penalità globale
function updateGlobalPenaltyDisplay() {
    document.getElementById('globalPenaltyValue').innerText = globalPenaltyPerPlayer;
}

// Funzione per cambiare la penalità globale
document.getElementById('changeGlobalPenalty').addEventListener('click', function() {
    const newPenalty = prompt("Inserisci la nuova penalità per giocatore:");
    
    const parsedPenalty = parseInt(newPenalty);
    if (isNaN(parsedPenalty) || parsedPenalty < 0) {
        alert("Per favore inserisci un numero valido per la penalità.");
        return;
    }

    globalPenaltyPerPlayer = parsedPenalty;
    updateGlobalPenaltyDisplay();

    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    teams.forEach(team => {
        team.penaltyTotal = team.notPlaying * globalPenaltyPerPlayer;
    });

    localStorage.setItem('teams', JSON.stringify(teams));
    loadTeams();
});

// Funzione per caricare le squadre dal localStorage
function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamsList = document.getElementById('teamsList').querySelector('tbody');
    teamsList.innerHTML = ''; // Pulisce la lista esistente

    teams.forEach((team, index) => {
        const row = document.createElement('tr');

        const canPlay = (team.players - team.notPlaying) >= 6;
        const playStatus = canPlay 
            ? '<span class="can-play">✅</span>' 
            : '<span class="cannot-play">❌</span>';

        const finalPoints = team.points !== null ? team.points - team.penaltyTotal : 'N/A';

        row.innerHTML = `
            <td>${team.teamName}</td>
            <td>${team.players}</td>
            <td>${team.notPlaying}</td>
            <td>${team.penaltyTotal}</td>
            <td>${playStatus}</td>
            <td>${team.points !== null ? team.points : 'N/A'}</td>
            <td>${canPlay ? finalPoints : 'N/A'}</td>
            <td>${canPlay && team.points === null ? `<button class="enterPointsBtn" data-index="${index}">Inserisci Punti</button>` : 'N/A'}</td>
            <td><button class="deleteBtn" data-index="${index}">Elimina</button></td>
        `;
        teamsList.appendChild(row);
    });
}

// Funzione per aggiungere una squadra
document.getElementById('teamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teamName = document.getElementById('teamName').value.trim();
    let players = parseInt(document.getElementById('players').value);
    let notPlaying = parseInt(document.getElementById('notPlaying').value);

    if (players < 6) {
        alert('Il numero totale di giocatori deve essere almeno 6.');
        return;
    }
    if (players < 0 || notPlaying < 0) {
        alert('I valori non possono essere negativi!');
        return;
    }

    const penaltyTotal = notPlaying * globalPenaltyPerPlayer;

    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamExists = teams.some(team => team.teamName.toLowerCase() === teamName.toLowerCase());
    
    if (teamExists) {
        alert('Esiste già una squadra con questo nome. Inserisci un nome diverso.');
        return;
    }

    teams.push({
        teamName,
        players,
        notPlaying,
        penaltyTotal,
        points: null
    });
    localStorage.setItem('teams', JSON.stringify(teams));

    this.reset();
    loadTeams();
});

// Event listener per i bottoni dinamici (Inserisci Punti e Elimina)
document.getElementById('teamsList').addEventListener('click', function(e) {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];

    if (e.target.classList.contains('enterPointsBtn')) {
        const index = e.target.dataset.index;
        const team = teams[index];

        if (team.points !== null) {
            alert('I punti sono già stati inseriti per questa squadra.');
            return;
        }

        let points = prompt(`Inserisci i punti per la squadra ${team.teamName}:`);
        points = parseInt(points);

        if (isNaN(points) || points < 0) {
            alert('I punti non possono essere negativi o vuoti!');
            return;
        }

        team.points = points;
        localStorage.setItem('teams', JSON.stringify(teams));
        loadTeams();
    } else if (e.target.classList.contains('deleteBtn')) {
        const index = e.target.dataset.index;
        teams.splice(index, 1);
        localStorage.setItem('teams', JSON.stringify(teams));
        loadTeams();
    }
});

// Funzione per calcolare il vincitore
document.getElementById('calculateWinner').addEventListener('click', function() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const eligibleTeams = teams.filter(team => (team.players - team.notPlaying) >= 6 && team.points !== null);
    
    if (eligibleTeams.length < 2) {
        alert("È necessario avere almeno due squadre idonee per calcolare il vincitore.");
        return;
    }

    let winner = eligibleTeams.reduce((prev, current) => {
        const prevScore = prev.points - prev.penaltyTotal;
        const currentScore = current.points - current.penaltyTotal;
        return (currentScore > prevScore) ? current : prev;
    });

    document.getElementById('winnerMessage').innerText = `La squadra vincitrice è ${winner.teamName} con un punteggio finale di ${winner.points - winner.penaltyTotal}.`;
});

// Funzione per resettare il calcolo del vincitore
document.getElementById('resetWinner').addEventListener('click', function() {
    document.getElementById('winnerMessage').innerText = ''; // Resetta il messaggio del vincitore
});

// Funzione per cancellare tutte le squadre
document.getElementById('clearAll').addEventListener('click', function() {
    localStorage.removeItem('teams'); // Rimuove tutte le squadre dal localStorage
    loadTeams(); // Ricarica la tabella delle squadre
    document.getElementById('winnerMessage').innerText = ''; // Resetta anche il messaggio del vincitore
});

// Carica le squadre al caricamento della pagina e aggiorna la penalità globale
updateGlobalPenaltyDisplay();
loadTeams();
