import React from 'react'
import '../App.css';

function SupportEntry(props) {
  // add props here
  const { logo, name, web } = props
  return (
    <div className="support">
      <a href={`${web}`}><img src={`img/${logo}`} width="300" height="300" alt="${name}" /></a>
      <br />
      <a className="author" href={`${web}`}>{name}</a>
    </div>
  )
}

export default SupportEntry
