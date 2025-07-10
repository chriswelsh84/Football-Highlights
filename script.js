const scoresContainer = document.getElementById('scores');
const ftScoresContainer = document.getElementById('ft-scores');
const scorebatScoresContainer = document.getElementById('scorebat-scores');
const newsArticlesContainer = document.getElementById('news-articles');

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
    // Only show European competitions
    const europeanComps = [
        'Champions League', 'UEFA Champions League', 'Europa League', 'UEFA Europa League',
        'Europa Conference League', 'UEFA Europa Conference League',
        'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
        'Eredivisie', 'Primeira Liga', 'Scottish Premiership',
        'Super Lig', 'Belgian Pro League', 'Swiss Super League',
        'Russian Premier League', 'Austrian Bundesliga', 'Greek Super League',
        'Ukrainian Premier League', 'Danish Superliga', 'Czech First League',
        'Norwegian Eliteserien', 'Swedish Allsvenskan', 'Polish Ekstraklasa',
        'Romanian Liga I', 'Croatian HNL', 'Serbian SuperLiga', 'Slovak Super Liga',
        'Slovenian PrvaLiga', 'Bulgarian First League', 'Cypriot First Division',
        'Hungarian NB I', 'Finnish Veikkausliiga', 'Irish Premier Division',
        'Scottish Championship', 'English Championship', 'English League One', 'English League Two'
    ];
    const filtered = matches.filter(match => {
        return europeanComps.some(comp =>
            (match.competition || '').toLowerCase().includes(comp.toLowerCase())
        );
    });
    if (filtered.length === 0) {
        scorebatScoresContainer.innerHTML = '<p class="no-matches">No recent European competition matches found.</p>';
        return;
    }
    filtered.slice(0, 10).forEach(match => {
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

async function fetchBBCSportsNews() {
    // Use BBC RSS feed (free and public)
    const rssUrl = 'https://feeds.bbci.co.uk/sport/rss.xml?edition=uk';
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        displayNewsArticles(data.items);
    } catch (error) {
        newsArticlesContainer.innerHTML = '<p class="error">Error fetching news. Please try again later.</p>';
        console.error('News Error:', error);
    }
}

function displayNewsArticles(articles) {
    newsArticlesContainer.innerHTML = '';
    if (!articles || articles.length === 0) {
        newsArticlesContainer.innerHTML = '<p class="no-matches">No news found.</p>';
        return;
    }
    articles.slice(0, 6).forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('news-article');
        articleDiv.innerHTML = `
            <a href="${article.link}" target="_blank" rel="noopener">
                <h4>${article.title}</h4>
                <p>${article.pubDate ? new Date(article.pubDate).toLocaleDateString() : ''}</p>
            </a>
        `;
        newsArticlesContainer.appendChild(articleDiv);
    });
}

// Static example for transfer news ticker
function fetchTransferNews() {
    const staticNews = [
        "Manchester United sign striker from Ajax",
        "Chelsea complete deal for French midfielder",
        "Liverpool announce new goalkeeper signing",
        "Arsenal agree terms with Italian defender",
        "Real Madrid secure Brazilian wonderkid",
        "Bayern Munich land Dutch winger",
        "Juventus confirm swap deal with Inter",
        "PSG sign Portuguese full-back"
    ];
    const ticker = document.getElementById('transfer-news-ticker');
    if (ticker) {
        ticker.textContent = staticNews.join('  •  ');
    }
}
document.addEventListener('DOMContentLoaded', fetchTransferNews);

fetchScorebatHighlights();
fetchFTScores();
fetchBBCSportsNews();