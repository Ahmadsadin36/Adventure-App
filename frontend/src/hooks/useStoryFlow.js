import { useCallback, useMemo, useState } from 'react'
import { api } from '../lib/api'


export function useStoryFlow() {
    const [theme, setTheme] = useState('fantasy')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [story, setStory] = useState(null)
    const [currentNodeId, setCurrentNodeId] = useState(null)


    const currentNode = useMemo(() => {
        if (!story || currentNodeId == null) return null
        return story.all_nodes[currentNodeId] || null
    }, [story, currentNodeId])


    const start = useCallback(async () => {
        setLoading(true)
        setError(null)
        setStory(null)
        setCurrentNodeId(null)
        try {
            const job = await api.createStory({ theme })
            let storyId = job.story_id || null


            if (!storyId && job.status !== 'failed') {
                // In OpenAI mode, job may take a moment → poll
                for (let i = 0; i < 25; i++) {
                    await new Promise(r => setTimeout(r, 600))
                    const j = await api.getJob(job.job_id)
                    if (j.status === 'completed' && j.story_id) { storyId = j.story_id; break }
                    if (j.status === 'failed') throw new Error(j.error || 'Generation failed')
                }
            }


            if (!storyId) throw new Error('Story ID missing')
            const full = await api.getCompleteStory(storyId)
            setStory(full)
            setCurrentNodeId(full.root_node.id)
        } catch (e) {
            setError(e.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [theme])


    const choose = useCallback((nextId) => { setCurrentNodeId(nextId) }, [])


    const reset = useCallback(() => { setStory(null); setCurrentNodeId(null); setError(null) }, [])


    return { theme, setTheme, loading, error, story, currentNode, currentNodeId, start, choose, reset }
}