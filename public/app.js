let globalPenaltyPerPlayer = 0;

function updateGlobalPenaltyDisplay() {
    document.getElementById('globalPenaltyValue').innerText = globalPenaltyPerPlayer;
}

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

function loadTeams() {
    fetch('/api/squadre')
        .then(response => response.json())
        .then(data => {
            const teams = data.teams;
            const teamsList = document.getElementById('teamsList').querySelector('tbody');
            teamsList.innerHTML = '';

            teams.forEach(team => {
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
                    <td>
                        ${canPlay && team.points === null ? 
                            `<button class="enterPointsBtn" data-id="${team.id}">Inserisci Punti</button>` 
                            : ''}
                        <button class="deleteBtn" data-id="${team.id}">Elimina</button>
                    </td>
                `;
                teamsList.appendChild(row);
            });

            const enterPointsButtons = document.querySelectorAll('.enterPointsBtn');
            enterPointsButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const teamId = this.dataset.id;
                    let points = prompt('Inserisci i punti per questa squadra:');
                    points = parseInt(points);

                    if (isNaN(points) || points < 0) {
                        alert('I punti devono essere un numero valido maggiore o uguale a 0.');
                        return;
                    }

                    fetch(`/api/squadre/${teamId}/punti`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ points: points })
                    })
                    .then(() => loadTeams());
                });
            });
        });
}

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

    const teamData = {
        teamName,
        players,
        notPlaying,
        penaltyTotal,
        points: null
    };

    fetch('/api/squadre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
    })
    .then(() => loadTeams());
});

document.getElementById('teamsList').addEventListener('click', function(e) {
    if (e.target.classList.contains('deleteBtn')) {
        const teamId = e.target.dataset.id;

        fetch(`/api/squadre/${teamId}`, { method: 'DELETE' })
        .then(() => loadTeams());
    }
});

document.getElementById('clearAll').addEventListener('click', function() {
    fetch('/api/squadre', { method: 'DELETE' })
    .then(() => loadTeams());
});

loadTeams();

