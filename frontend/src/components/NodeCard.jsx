import OptionButton from "./OptionButton";

export default function NodeCard({ node, onPick }) {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{node.content}</p>
        </div>

        {node.is_ending ? (
          <div className="mt-2">
            <span
              className={`badge ${
                node.is_winning_ending ? "badge-success" : "badge-error"
              }`}
            >
              {node.is_winning_ending ? "Winning ending" : "Ending"}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {node.options?.map((opt, idx) => (
              <OptionButton key={idx} opt={opt} onPick={onPick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
