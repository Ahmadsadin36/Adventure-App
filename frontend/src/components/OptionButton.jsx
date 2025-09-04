export default function OptionButton({ opt, onPick }) {
  return (
    <button
      className="btn btn-secondary btn-sm normal-case"
      disabled={!opt.node_id}
      onClick={() => opt.node_id && onPick(opt.node_id)}
    >
      {opt.text}
    </button>
  );
}
