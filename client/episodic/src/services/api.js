const API_URL = import.meta.env.VITE_API_URL;
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed: ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
}

export const api = {
    getTrending: () => request('/api/tmdb/trending'),
    searchShows: (query) => request(`/api/tmdb/search?query=${encodeURIComponent(query)}`),
    getShow: (id) => request(`/api/tmdb/tv/${id}`),
    getSeason: (id, seasonNumber) => request(`/api/tmdb/tv/${id}/season/${seasonNumber}`),
    getTvGenres: () => request('/api/tmdb/genres/tv'),
    discoverByGenre: (genreId) => request(`/api/tmdb/discover?genre=${genreId}`),
    discover: (params) => request(`/api/tmdb/discover?${new URLSearchParams(params).toString()}`),

    getMyTracking: () => request('/api/tracking'),
    getTrackingForShow: (tmdbId) => request(`/api/tracking/${tmdbId}`),
    setTracking: (tmdbId, data) =>
        request(`/api/tracking/${tmdbId}`, { method: 'PUT', body: JSON.stringify(data) }),
    setEpisodesWatched: (tmdbId, data) =>
        request(`/api/tracking/${tmdbId}/episodes`, { method: 'PUT', body: JSON.stringify(data) }),
    removeTracking: (tmdbId) => request(`/api/tracking/${tmdbId}`, { method: 'DELETE' }),

    getReviewsForShow: (tmdbId) => request(`/api/reviews/${tmdbId}`),
    setReview: (tmdbId, season, data) =>
        request(`/api/reviews/${tmdbId}/${season}`, { method: 'PUT', body: JSON.stringify(data) }),
    removeReview: (tmdbId, season) =>
        request(`/api/reviews/${tmdbId}/${season}`, { method: 'DELETE' }),

    searchUsers: (query) => request(`/api/users?search=${encodeURIComponent(query)}`),
    getUserByUsername: (username) => request(`/api/users/username/${username}`),
    getPublicTracking: (userId) => request(`/api/tracking/user/${userId}`),
    getPublicReviews: (userId) => request(`/api/reviews/user/${userId}`),

    getFollowers: (userId) => request(`/api/follows/${userId}/followers`),
    getFollowing: (userId) => request(`/api/follows/${userId}/following`),
    getFollowStatus: (userId) => request(`/api/follows/${userId}/status`),
    followUser: (userId) => request(`/api/follows/${userId}`, { method: 'POST' }),
    unfollowUser: (userId) => request(`/api/follows/${userId}`, { method: 'DELETE' }),

    getFeed: () => request('/api/feed'),

    registerWithEmail: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    loginWithEmail: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    updateProfile: (data) => request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await fetch(`${API_URL}/api/users/me/avatar`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || `Request failed: ${res.status}`);
        }
        return res.json();
    },

    getPublicLists: () => request('/api/lists'),
    getMyLists: () => request('/api/lists/mine'),
    getUserLists: (userId) => request(`/api/lists/user/${userId}`),
    getList: (id) => request(`/api/lists/${id}`),
    createList: (data) => request('/api/lists', { method: 'POST', body: JSON.stringify(data) }),
    updateList: (id, data) => request(`/api/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteList: (id) => request(`/api/lists/${id}`, { method: 'DELETE' }),
};
