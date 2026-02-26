"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#18181b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: "0 auto 16px", color: "#f97316" }}
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "#a1a1aa",
                fontSize: "0.875rem",
                marginBottom: "4px",
              }}
            >
              A critical error occurred. Please try again.
            </p>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.75rem",
                marginBottom: "24px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {error.message}
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
