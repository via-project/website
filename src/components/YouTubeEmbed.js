import React, { useState } from "react";

// Lightweight YouTube facade: shows the high-res poster (maxresdefault) and only
// loads the real iframe on click (with autoplay). Gives a sharp preview and
// keeps YouTube's player JS off the page until the user actually plays a video.
// Expects to fill a parent that sets the aspect ratio (e.g. an aspect-ratio box).
function YouTubeEmbed({ id, title }) {
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
  );

  if (playing) {
    return (
      <iframe
        style={{ width: "100%", height: "100%", border: 0 }}
        src={`https://www.youtube.com/embed/${id}?rel=0&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="yt-facade"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={poster}
        alt=""
        loading="lazy"
        // maxresdefault 404s for videos uploaded below 720p — fall back to the
        // always-present hqdefault in that case.
        onError={() => setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
      />
      <span className="yt-facade-play" aria-hidden="true">
        <svg viewBox="0 0 68 48" width="68" height="48">
          <path
            className="yt-facade-play-bg"
            d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
          />
          <path d="M 45,24 27,14 27,34 Z" fill="#fff" />
        </svg>
      </span>
    </button>
  );
}

export default YouTubeEmbed;
