/**
 * LivePreview — a view's interactive render, played in the panel.
 *
 * `infa publish` stores each view's render as one self-contained HTML file
 * (`component_views.preview_html_url`). Storage may serve it as text, so it
 * is fetched and played from `srcdoc`, in a sandbox that runs its scripts
 * and nothing else: no same-origin access to Storybook, no forms, no popups.
 * Nothing is fetched until the person asks for it.
 */

import React, { useEffect, useState } from "react";
import { LiveFrame, LiveNotice } from "./styles";

interface LivePreviewProps {
  url: string;
  title: string;
}

/** Fetches the render once and plays it. */
export const LivePreview: React.FC<LivePreviewProps> = ({ url, title }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    setError(null);
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((text) => alive && setHtml(text))
      .catch((err: Error) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [url]);

  if (error) return <LiveNotice>The live render did not load ({error}).</LiveNotice>;
  if (html === null) return <LiveNotice>Loading the live render…</LiveNotice>;
  return (
    <LiveFrame
      title={`${title} (live)`}
      sandbox="allow-scripts"
      srcDoc={html}
      data-testid="infa-usage-live-frame"
    />
  );
};
