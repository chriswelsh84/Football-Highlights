const scoresContainer = document.getElementById('scores');
const ftScoresContainer = document.getElementById('ft-scores');
const scorebatScoresContainer = document.getElementById('scorebat-scores');

async function fetchScorebatHighlights() {
    try {
        const response = await fetch('https://www.scorebat.com/video-api/v3/');
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        displayScorebatHighlights(data.response);
    } catch (error) {
        scorebatScoresContainer.innerHTML = '<p class="error">Error fetching highlights. Please try again later.</p>';
        console.error('Error:', error);
    }
}

function displayScorebatHighlights(matches) {
    scorebatScoresContainer.innerHTML = '';
    if (!matches || matches.length === 0) {
        scorebatScoresContainer.innerHTML = '<p class="no-matches">No recent matches found.</p>';
        return;
    }
    matches.slice(0, 10).forEach(match => {
        // Try to extract score from the title, e.g. "Manchester City 2-1 Manchester United"
        let score = '';
        let teams = '';
        // Regex: team1 (name) score (e.g. 2-1) team2 (name)
        const scoreRegex = /^(.*?)\s+(\d{1,2}[-–:]\d{1,2})\s+(.*?)$/;
        const m = match.title.match(scoreRegex);
        if (m) {
            teams = `${m[1]} vs ${m[3]}`;
            score = m[2].replace('–', '-').replace(':', '-');
        } else {
            // Replace ' - ' or '-' with ' vs '
            teams = match.title.replace(/\s*-\s*/g, ' vs ');
        }
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        matchElement.innerHTML = `
            <div>
                <h3>⚽ ${teams}</h3>
                <p>Competition: ${match.competition}</p>
                ${score ? `<p class="score">Score: ${score}</p>` : ''}
                <a href="${match.matchviewUrl}" target="_blank">Watch Highlights</a>
            </div>
        `;
        scorebatScoresContainer.appendChild(matchElement);
    });
}

async function fetchFTScores() {
    const today = new Date().toISOString().slice(0, 10);
    // Try both relative and absolute URLs for local dev
    const endpoints = [
        `/api/competitions/PL/matches?dateFrom=${today}&dateTo=${today}`,
        `http://localhost:5000/api/competitions/PL/matches?dateFrom=${today}&dateTo=${today}`,
        `https://localhost:5001/api/competitions/PL/matches?dateFrom=${today}&dateTo=${today}` // for HTTPS .NET
    ];
    let lastError = '';
    for (const url of endpoints) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (data && data.matches) {
                displayFTScores(data.matches);
                return;
            }
            throw new Error('No matches data');
        } catch (error) {
            lastError = error.message;
        }
    }
    ftScoresContainer.innerHTML = `<p class="error">Error fetching FT scores. Backend unreachable or misconfigured.<br><span style='font-size:0.9em;color:#aaa'>${lastError}</span></p>`;
    console.error('FT Scores Error:', lastError);
}

function displayFTScores(matches) {
    ftScoresContainer.innerHTML = '';
    if (!matches || matches.length === 0) {
        ftScoresContainer.innerHTML = '<p class="no-matches">No finished matches found for today.</p>';
        return;
    }
    matches.forEach(match => {
        if (match.status !== 'FINISHED') return;
        const teams = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
        const score = match.score.fullTime.home !== null && match.score.fullTime.away !== null
            ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
            : '';
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        matchElement.innerHTML = `
            <div>
                <h3>⚽ ${teams}</h3>
                <p>Competition: ${match.competition?.name || 'N/A'}</p>
                ${score ? `<p class="score">FT: ${score}</p>` : ''}
            </div>
        `;
        ftScoresContainer.appendChild(matchElement);
    });
}

// Initial fetch
fetchScorebatHighlights();
fetchFTScores();
// Optionally refresh every 10 minutes
setInterval(fetchScorebatHighlights, 600000);
setInterval(fetchFTScores, 600000);