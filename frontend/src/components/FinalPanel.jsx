// src/components/FinalPanel.jsx
export default function FinalPanel({ title, finalText, backgroundQuery }) {
  // Uses Unsplash Source to fetch a themed image (no API key)
  const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(
    backgroundQuery
  )}`;

  return (
    <section className="relative w-full rounded-2xl overflow-hidden shadow-xl">
      <img
        src={url}
        alt={backgroundQuery}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="relative bg-base-100/50 backdrop-blur-md p-5 md:p-8">
        <h3 className="text-xl md:text-2xl font-semibold mb-3">
          {title || "Your Story"}
        </h3>
        {finalText ? (
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {finalText}
          </div>
        ) : (
          <div className="opacity-70">
            Follow choices to build your final story…
          </div>
        )}
      </div>
    </section>
  );
}
