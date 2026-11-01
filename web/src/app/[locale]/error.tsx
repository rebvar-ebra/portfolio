"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-frame not-found">
      <div><strong>!</strong><h1>This page could not be loaded.</h1><button className="button button-primary" onClick={reset}>Try again</button></div>
    </div>
  );
}
