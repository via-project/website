// src/Tiles.js

import React from 'react'
import './App.css';

function Tiles() {
  return (
    <div className="section">
      <div className="background" style={{backgroundImage: "url(img/mw_igor_desktop.jpg)"}}></div>
      <div className="inner-left-bottom" style={{textAlign:"center", maxWidth:"100%"}}>
        <h1 style={{textTransform: "uppercase", marginBottom: "13px"}}>The Via Project</h1>
        <h3 style={{textTransform: "uppercase"}}>Frontier of discovery in the Milky Way</h3>
      </div>
    </div>
  )
}

export default Tiles
