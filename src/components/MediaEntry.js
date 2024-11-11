import React from 'react'
import '../App.css';

function MediaEntry(props) {
  // add props here
  const { name, source, author, web, description } = props
  return (
    <div className="media">
      <a href={`${source}`}><img src={`img/${name}`} width="300" height="300" alt="${name}" /></a>
      <p>by</p>
      <a className="author" href={`${web}`}>{author}</a>
      <div>{description}</div>
    </div>
  )
}

export default MediaEntry
