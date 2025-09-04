const API_BASE = import.meta.env.VITE_API_BASE || '' // Vite proxy handles /api in dev


async function http(url, init) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // keep session_id cookie from backend
        ...init,
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
    }
    return res.json()
}


export const api = {
    createStory(body) {
        return http('/api/stories/create', { method: 'POST', body: JSON.stringify(body) })
    },
    getJob(jobId) {
        return http(`/api/jobs/${jobId}`)
    },
    getCompleteStory(storyId) {
        return http(`/api/stories/${storyId}/complete`)
    },
}