// src/hooks/useStoryFlow.js
import { useCallback, useMemo, useState } from 'react';
import { api } from '../lib/api';

function buildParentMap(story) {
    const parents = {};
    const rootId = story.root_node.id;

    // DFS/BFS through options to map child -> parent
    const stack = [rootId];
    while (stack.length) {
        const id = stack.pop();
        const node = story.all_nodes[id];
        if (!node || node.is_ending) continue;
        for (const opt of node.options || []) {
            if (!opt.node_id) continue;
            parents[opt.node_id] = id;
            stack.push(opt.node_id);
        }
    }
    return parents;
}

export function useStoryFlow() {
    const [theme, setTheme] = useState('fantasy');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [story, setStory] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState(null);
    const [parents, setParents] = useState({});

    const currentNode = useMemo(() => {
        if (!story || currentNodeId == null) return null;
        return story.all_nodes?.[currentNodeId] ?? null;
    }, [story, currentNodeId]);

    // derive path root -> current
    const currentPathIds = useMemo(() => {
        if (!story || currentNodeId == null) return [];
        const path = [currentNodeId];
        const rootId = story.root_node.id;
        let cur = currentNodeId;
        while (cur !== rootId) {
            const p = parents[cur];
            if (!p) break; // safety
            path.push(p);
            cur = p;
        }
        return path.reverse();
    }, [story, currentNodeId, parents]);

    const finalText = useMemo(() => {
        if (!story || currentPathIds.length === 0) return '';
        return currentPathIds
            .map(id => story.all_nodes[id]?.content || '')
            .filter(Boolean)
            .join('\n\n');
    }, [story, currentPathIds]);

    const start = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStory(null);
        setCurrentNodeId(null);
        setParents({});
        try {
            const job = await api.createStory({ theme });
            let storyId = job.story_id ?? null;

            if (!storyId && job.status !== 'failed') {
                // Poll (OpenAI mode). In sample mode, we already have story_id immediately
                for (let i = 0; i < 25; i++) {
                    // ~15s total
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise(r => setTimeout(r, 600));
                    // eslint-disable-next-line no-await-in-loop
                    const j = await api.getJob(job.job_id);
                    if (j.status === 'completed' && j.story_id) { storyId = j.story_id; break; }
                    if (j.status === 'failed') throw new Error(j.error || 'Generation failed');
                }
            }

            if (!storyId) throw new Error('Story ID missing');
            const full = await api.getCompleteStory(storyId);
            setStory(full);
            setCurrentNodeId(full.root_node.id);
            setParents(buildParentMap(full));
        } catch (e) {
            setError(e.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [theme]);

    const choose = useCallback((nextId) => setCurrentNodeId(nextId), []);
    const reset = useCallback(() => {
        setStory(null);
        setCurrentNodeId(null);
        setError(null);
        setParents({});
    }, []);

    // for background query
    const backgroundQuery = useMemo(() => {
        const base = story?.title || theme || 'adventure';
        return `${base} fantasy`;
    }, [story, theme]);

    return {
        theme, setTheme,
        loading, error,
        story, currentNode, currentNodeId,
        currentPathIds, finalText, backgroundQuery,
        start, choose, reset
    };
}
