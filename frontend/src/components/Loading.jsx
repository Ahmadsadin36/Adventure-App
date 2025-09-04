export default function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm opacity-80">
      <span className="loading loading-spinner loading-sm" />
      Generating...
    </div>
  );
}
