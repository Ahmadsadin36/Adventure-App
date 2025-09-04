import "./App.css";
import ThemeForm from "./components/ThemeForm";
import StoryTree from "./components/StoryTree";
import NodeCard from "./components/NodeCard";
import { useStoryFlow } from "./hooks/useStoryFlow";

export default function App() {
  const {
    theme,
    setTheme,
    loading,
    error,
    story,
    currentNode,
    currentNodeId,
    start,
    choose,
    reset,
  } = useStoryFlow();

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Adventure App</h1>
          <div className="badge badge-outline">Frontend (React JS)</div>
        </header>

        <ThemeForm
          theme={theme}
          setTheme={setTheme}
          loading={loading}
          onStart={start}
          onReset={reset}
        />

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {story && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <aside className="md:col-span-5 lg:col-span-4">
              <div className="card bg-base-200 h-[65vh]">
                <div className="card-body">
                  <h2 className="card-title">Outline</h2>
                  <StoryTree
                    story={story}
                    currentId={currentNodeId}
                    onPick={choose}
                  />
                </div>
              </div>
            </aside>
            <main className="md:col-span-7 lg:col-span-8">
              {currentNode ? (
                <NodeCard node={currentNode} onPick={choose} />
              ) : (
                <div className="mockup-window border bg-base-200">
                  <div className="px-4 py-8">Click a node to begin</div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
