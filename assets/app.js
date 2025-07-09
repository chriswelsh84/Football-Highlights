const API_BASE = '/api';

// Helper to fetch and merge matches from multiple competitions
async function fetchMatchesForCompetitions(competitions, params, debugId) {
    const allMatches = [];
    let debugInfo = '';
    for (const comp of competitions) {
        try {
            const data = await fetchFootballData(`/competitions/${comp}/matches${params}`);
            debugInfo += `<div><b>${comp}:</b> ${data ? JSON.stringify(data) : 'No data'}</div>`;
            if (data && data.matches && data.matches.length) {
                allMatches.push(...data.matches);
            }
        } catch (err) {
            debugInfo += `<div><b>${comp}:</b> Error: ${err.message}</div>`;
        }
    }
    if (debugId) {
        document.getElementById(debugId).innerHTML = debugInfo;
    }
    return allMatches;
}

async function fetchFootballData(endpoint) {
    const url = `${API_BASE}${endpoint}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('API error: ' + res.status);
        return await res.json();
    } catch (err) {
        throw err;
    }
}

async function loadFixtures() {
    document.getElementById("fixtures-list").innerText = "Live fixtures are not available from free public sources.";
}

async function loadResults() {
    document.getElementById("results-list").innerText = "Live results are not available from free public sources.";
}

async function loadLiveScores() {
    document.getElementById("scores-list").innerText = "Live scores are not available from free public sources.";
}

async function loadHighlights() {
    // Use Scorebat's free video API for recent match highlights
    const url = 'https://www.scorebat.com/video-api/v3/';
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.response && data.response.length) {
            renderList("highlights-list", data.response.slice(0, 8), m =>
                `<div style='margin-bottom:1em;'>
                    <b>${m.title}</b> <span style='color:#b3e6ff;'>(${m.competition})</span><br>
                    <a href="${m.matchviewUrl}" target="_blank">Watch Highlights</a>
                </div>`
            );
        } else {
            document.getElementById("highlights-list").innerText = "No highlights found.";
        }
    } catch (err) {
        document.getElementById("highlights-list").innerText = "Failed to load highlights.";
    }
}

async function loadTransferNews() {
    // Use BBC Sport RSS feed for UK transfer news
    const rssUrl = 'https://feeds.bbci.co.uk/sport/football/transfer-news/rss.xml';
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await res.json();
        if (data && data.items && data.items.length) {
            renderList("news-list", data.items.slice(0, 8), n => `<div>📰 <a href="${n.link}" target="_blank">${n.title}</a> <span style='color:#b3e6ff;'>(${n.pubDate.slice(0,10)})</span></div>`);
        } else {
            document.getElementById("news-list").innerText = "No transfer news found.";
        }
    } catch (err) {
        document.getElementById("news-list").innerText = "Failed to load transfer news.";
    }
}

async function loadBBCNews() {
    // Use BBC Sport RSS feed for general football news
    const rssUrl = 'https://feeds.bbci.co.uk/sport/football/rss.xml';
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await res.json();
        if (data && data.items && data.items.length) {
            renderList("bbc-news-list", data.items.slice(0, 8), n => `<div>📰 <a href="${n.link}" target="_blank">${n.title}</a> <span style='color:#b3e6ff;'>(${n.pubDate.slice(0,10)})</span></div>`);
        } else {
            document.getElementById("bbc-news-list").innerText = "No football news found.";
        }
    } catch (err) {
        document.getElementById("bbc-news-list").innerText = "Failed to load football news.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadFixtures();
    loadResults();
    loadLiveScores();
    loadHighlights();
    loadBBCNews();
    loadTransferNews();
});

function renderList(id, items, renderFn) {
    const el = document.getElementById(id);
    el.innerHTML = items && items.length ? items.map(renderFn).join("") : "No data available.";
}
