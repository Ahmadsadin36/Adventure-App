import Loading from "./Loading";

export default function ThemeForm({
  theme,
  setTheme,
  loading,
  onStart,
  onReset,
}) {
  return (
    <div className="flex items-end gap-2">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Theme</span>
        </div>
        <input
          className="input input-bordered w-full"
          placeholder="e.g. space pirates in a solar storm"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
      </label>
      <button className="btn btn-primary" onClick={onStart} disabled={loading}>
        Generate
      </button>
      <button className="btn" onClick={onReset} disabled={loading}>
        Reset
      </button>
      {loading && <Loading />}
    </div>
  );
}
