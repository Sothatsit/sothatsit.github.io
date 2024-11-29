let players = [];
let matchupsHistory = {}; // Tracks how many times each pair has played
let currentGame = 1;
const totalGames = 6;

// Load state from localStorage on page load
window.onload = () => {
    loadState();
    updatePlayerList();
    displaySavedMatchups();
};

document.getElementById('add-player').addEventListener('click', addPlayer);
document.getElementById('generate-matchups').addEventListener('click', generateMatchups);
document.getElementById('reset-tournament').addEventListener('click', resetTournament);

function addPlayer() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        updatePlayerList();
        document.getElementById('player-name').value = '';
        saveState();
    }
}

function updatePlayerList() {
    const playersUl = document.getElementById('players');
    playersUl.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = player;
        const removeBtn = document.createElement('span');
        removeBtn.textContent = ' [Remove]';
        removeBtn.className = 'remove-player';
        removeBtn.addEventListener('click', () => removePlayer(index));
        li.appendChild(removeBtn);
        playersUl.appendChild(li);
    });
}

function removePlayer(index) {
    const removedPlayer = players.splice(index, 1)[0];
    // Remove any existing match-ups involving the removed player
    Object.keys(matchupsHistory).forEach(key => {
        if (key.includes(removedPlayer)) {
            delete matchupsHistory[key];
        }
    });
    updatePlayerList();
    saveState();
}

function generateMatchups() {
    if (currentGame > totalGames) {
        alert('All games have been scheduled.');
        return;
    }
    if (players.length < 2) {
        alert('Not enough players to generate match-ups.');
        return;
    }

    const matchups = createMatchups();
    if (matchups.length === 0) {
        alert('No possible match-ups could be generated.');
        return;
    }

    displayMatchups(matchups);
    currentGame++;
    saveState();
}

function createMatchups() {
    const availablePlayers = [...players];
    const matchups = [];
    availablePlayers.sort(() => Math.random() - 0.5); // Shuffle players for randomness

    while (availablePlayers.length > 1) {
        const player1 = availablePlayers.shift();

        // Find the opponent with whom player1 has played the fewest times
        let opponentIndex = -1;
        let minMatches = Infinity;

        for (let i = 0; i < availablePlayers.length; i++) {
            const player2 = availablePlayers[i];
            const matchupKey = [player1, player2].sort().join('-');
            const matchesPlayed = matchupsHistory[matchupKey] || 0;

            if (matchesPlayed < minMatches) {
                minMatches = matchesPlayed;
                opponentIndex = i;
            }
        }

        if (opponentIndex !== -1) {
            const player2 = availablePlayers.splice(opponentIndex, 1)[0];
            const matchupKey = [player1, player2].sort().join('-');
            matchups.push({ player1, player2 });

            // Update match-ups history
            matchupsHistory[matchupKey] = (matchupsHistory[matchupKey] || 0) + 1;
        } else {
            // No opponent found, this shouldn't happen but just in case
            break;
        }
    }

    // If there's an odd player out, they get a bye
    if (availablePlayers.length === 1) {
        const player = availablePlayers.shift();
        matchups.push({ player1: player, player2: 'Bye' });
    }

    return matchups;
}

function displayMatchups(matchups) {
    const matchupsDiv = document.getElementById('matchups');

    // Create a game container
    const gameDiv = document.createElement('div');
    gameDiv.className = 'game';
    gameDiv.setAttribute('data-game', currentGame);

    gameDiv.innerHTML = `<h3>Game ${currentGame}</h3>`;
    const ul = document.createElement('ul');
    matchups.forEach(match => {
        const li = document.createElement('li');
        if (match.player2 === 'Bye') {
            li.textContent = `${match.player1} has a bye.`;
        } else {
            li.textContent = `${match.player1} vs ${match.player2}`;
        }
        ul.appendChild(li);
    });
    gameDiv.appendChild(ul);
    matchupsDiv.appendChild(gameDiv);
}

function saveState() {
    const state = {
        players,
        matchupsHistory,
        currentGame,
        matchupsHTML: document.getElementById('matchups').innerHTML
    };
    localStorage.setItem('tournamentState', JSON.stringify(state));
}

function loadState() {
    const stateJSON = localStorage.getItem('tournamentState');
    if (stateJSON) {
        const state = JSON.parse(stateJSON);
        players = state.players || [];
        matchupsHistory = state.matchupsHistory || {};
        currentGame = state.currentGame || 1;
    }
}

function displaySavedMatchups() {
    const stateJSON = localStorage.getItem('tournamentState');
    if (stateJSON) {
        const state = JSON.parse(stateJSON);
        const matchupsDiv = document.getElementById('matchups');
        matchupsDiv.innerHTML = state.matchupsHTML || '';
    }
}

function resetTournament() {
    const confirmReset = confirm('Are you sure you want to reset the tournament? This will erase all data.');
    if (confirmReset) {
        // Clear variables
        players = [];
        matchupsHistory = {};
        currentGame = 1;

        // Clear displays
        updatePlayerList();
        document.getElementById('matchups').innerHTML = '';

        // Clear localStorage
        localStorage.removeItem('tournamentState');
    }
}
