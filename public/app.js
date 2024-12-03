// Caricare squadre dal database 
async function loadTeams() {
    try {
        const response = await fetch('/api/squadre');
        if (!response.ok) throw new Error('Errore nel recupero delle squadre.');
        const { teams } = await response.json();

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

// Elimina una squadra dal database 
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

// Funzione per calcolare il vincitore
document.getElementById('calculateWinner').addEventListener('click', function() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const eligibleTeams = teams.filter(team => (team.players - team.notPlaying) >= 6 && team.points !== null);
    
    if (eligibleTeams.length < 2) {
        alert("È necessario almeno due squadre per calcolare un vincitore.");
        return;
    }

    const bestTeam = eligibleTeams.reduce((best, team) => {
        const totalScore = team.points - team.penaltyTotal;
        return (totalScore > best.totalScore) ? { team, totalScore } : best;
    }, { totalScore: -Infinity });

    alert(`La squadra vincitrice è: ${bestTeam.team.teamName}`);
});

// Carica le squadre all'inizio
loadTeams();
