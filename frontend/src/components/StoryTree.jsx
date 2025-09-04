function TreeNode({ id, story, currentId, onPick }) {
  const n = story.all_nodes[id];
  return (
    <li>
      <details open={id === story.root_node.id}>
        <summary>
          <button
            className={`link link-hover ${
              currentId === id ? "text-primary font-semibold" : ""
            }`}
            onClick={() => onPick(id)}
          >
            #{id} {n.is_ending ? "🧿" : "🧭"} — {n.content.slice(0, 48)}
            {n.content.length > 48 ? "…" : ""}
          </button>
        </summary>
        {!n.is_ending && (
          <ul>
            {n.options.map((o, i) =>
              o.node_id ? (
                <TreeNode
                  key={`${id}-${i}`}
                  id={o.node_id}
                  story={story}
                  currentId={currentId}
                  onPick={onPick}
                />
              ) : null
            )}
          </ul>
        )}
      </details>
    </li>
  );
}

export default function StoryTree({ story, currentId, onPick }) {
  return (
    <div className="overflow-auto h-full pr-2">
      <ul className="menu bg-base-200 rounded-box w-full">
        <TreeNode
          id={story.root_node.id}
          story={story}
          currentId={currentId}
          onPick={onPick}
        />
      </ul>
    </div>
  );
}
