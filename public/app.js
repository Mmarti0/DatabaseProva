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
    loadTeams();
});

// Funzione per caricare le squadre
function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamsList = document.getElementById('teamsList').querySelector('tbody');
    teamsList.innerHTML = ''; // Pulisce la lista esistente

    teams.forEach((team, index) => {
        const row = document.createElement('tr');

        // Calcola se la squadra può giocare
        const canPlay = (team.players - team.notPlaying) >= 6;
        const playStatus = canPlay 
            ? '<span class="can-play">✅</span>' // Spunta verde per squadra che può giocare
            : '<span class="cannot-play">❌</span>'; // Crocetta rossa per squadra che non può giocare

        // Calcolo del punteggio finale
        const finalPoints = team.points !== null ? team.points - team.penaltyTotal : 'N/A';

        // Aggiungi la riga con il bottone "Inserisci i Punti" solo se la squadra è idonea
        row.innerHTML = `
            <td>${team.teamName}</td>
            <td>${team.players}</td>
            <td>${team.notPlaying}</td>
            <td>${team.penaltyTotal}</td>
            <td>${playStatus}</td>
            <td>${team.points !== null ? team.points : 'N/A'}</td>
            <td>${canPlay ? finalPoints : 'N/A'}</td>
            <td>
                ${canPlay && team.points === null ? 
                    `<button class="enterPointsBtn" data-index="${index}">Inserisci Punti</button>` 
                    : ''}
                <button class="deleteBtn" data-index="${index}">Elimina</button>
            </td>
        `;

        teamsList.appendChild(row);
    });

    // Aggiungi l'evento per il bottone "Inserisci Punti"
    const enterPointsButtons = document.querySelectorAll('.enterPointsBtn');
    enterPointsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            const team = teams[index];

            let points = prompt(`Inserisci i punti per la squadra ${team.teamName}:`);
            points = parseInt(points);

            if (isNaN(points) || points < 0) {
                alert('I punti devono essere un numero valido maggiore o uguale a 0.');
                return;
            }

            team.points = points;
            localStorage.setItem('teams', JSON.stringify(teams));
            loadTeams();
        });
    });
}

// Funzione per aggiungere una squadra
document.getElementById('teamForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const teamName = document.getElementById('teamName').value.trim();
    let players = parseInt(document.getElementById('players').value);
    let notPlaying = parseInt(document.getElementById('notPlaying').value);
    const penaltyTotal = notPlaying * globalPenaltyPerPlayer;

    if (players < 6) {
        alert('Il numero totale di giocatori deve essere almeno 6.');
        return;
    }

    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamExists = teams.some(team => team.teamName.toLowerCase() === teamName.toLowerCase());
    
    if (teamExists) {
        alert('Questa squadra esiste già.');
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
    loadTeams();
});

// Funzione per eliminare una squadra
document.getElementById('teamsList').addEventListener('click', function(e) {
    if (e.target.classList.contains('deleteBtn')) {
        const index = e.target.dataset.index;
        const teams = JSON.parse(localStorage.getItem('teams')) || [];
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
        alert("È necessario almeno due squadre per calcolare un vincitore.");
        return;
    }

    const bestTeam = eligibleTeams.reduce((best, team) => {
        const totalScore = team.points - team.penaltyTotal;
        return (totalScore > best.totalScore) ? { team, totalScore } : best;
    }, { totalScore: -Infinity });

    alert(`La squadra vincitrice è: ${bestTeam.team.teamName}`);
});

// Funzione per cancellare tutte le squadre
document.getElementById('clearAll').addEventListener('click', function() {
    localStorage.setItem('teams', JSON.stringify([]));
    loadTeams();
});

// Carica le squadre all'avvio
loadTeams();
