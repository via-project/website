import React from 'react'

// Shows the actual site image (CSS-cropped to a thumbnail via .media img),
// lazily loaded — no separate *_thumb files to maintain.
function MediaEntry({ image, author, creditUrl, description }) {
  return (
    <div className="media">
      <a href={creditUrl}><img src={image} loading="lazy" alt={description} /></a>
      <p>by</p>
      <a className="author" href={creditUrl}>{author}</a>
      <div>{description}</div>
    </div>
  )
}

export default MediaEntry
