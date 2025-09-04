// src/components/Footer.jsx
export default function Footer({
  name = "Ahmad Sadin",
  github = "https://github.com/your-handle",
}) {
  return (
    <footer className="flex flex-row items-center justify-center p-4 mt-8 bg-base-200 rounded-xl">
      <nav className=" grid grid-cols-1 max-sm:gap-2 sm:grid-cols-5">
        <span className="font-semibold col-span-1">{name}</span>
        <span className="opacity-70 col-span-1 flex items-center justify-center max-sm:hidden">
          •
        </span>
        <a
          className=" hover:link-primary col-span-1 flex items-center justify-center"
          href={github}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <span className="opacity-70 col-span-1 flex items-center justify-center max-sm:hidden">
          •
        </span>

        <a
          className=" hover:link-primary col-span-1 flex items-center justify-center"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Back to top
        </a>
      </nav>
    </footer>
  );
}
