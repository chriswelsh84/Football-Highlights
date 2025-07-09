const apiKey = 'e536a6308caf43399a551a1332ae401b';
const scoresContainer = document.getElementById('scores');

async function fetchLiveScores() {
    try {
        const response = await fetch('https://api.football-data.org/v4/matches?status=LIVE', {
            headers: {
                'X-Auth-Token': apiKey
            }
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        displayScores(data.matches);
    } catch (error) {
        scoresContainer.innerHTML = '<p class="error">Error fetching scores. Please try again later.</p>';
        console.error('Error:', error);
    }
}

function displayScores(matches) {
    scoresContainer.innerHTML = '';
    if (matches.length === 0) {
        scoresContainer.innerHTML = '<p class="no-matches">No live matches at the moment.</p>';
        return;
    }

    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        matchElement.innerHTML = `
            <div>
                <h3>${match.homeTeam.name} vs ${match.awayTeam.name}</h3>
                <p>Competition: ${match.competition.name}</p>
                <p>Status: ${match.status}</p>
            </div>
            <p class="score">${match.score.fullTime.home ?? 0} - ${match.score.fullTime.away ?? 0}</p>
        `;
        scoresContainer.appendChild(matchElement);
    });
}

// Initial fetch
fetchLiveScores();
// Refresh every 60 seconds
setInterval(fetchLiveScores, 60000);