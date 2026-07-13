const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function tmdbFetch(path, params = {}) {
    const url = new URL(TMDB_BASE_URL + path);
    url.searchParams.set('api_key', process.env.TMDB_API_KEY);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error(`TMDB request failed: ${res.status}`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

module.exports = { tmdbFetch };
