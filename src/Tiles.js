// src/Tiles.js

import React from 'react'
import './App.css';
import Section from './components/Section';

function Tiles() {
  return (
    <Section bg="img/mw_igor_desktop.jpg" inner="left-bottom" innerStyle={{textAlign:"center", maxWidth:"100%"}}>
      <h1 style={{textTransform: "uppercase", marginBottom: "13px"}}>The Via Project</h1>
      <h3 style={{textTransform: "uppercase"}}>Frontier of discovery in the Milky Way</h3>
    </Section>
  )
}

export default Tiles
