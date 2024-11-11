// src/Title.js

import React, { useState } from 'react';
import './App.css';

function Title() {
  
  const [isOpen, setIsOpen] = useState(false);
  
  function handleClick() {
    setIsOpen(current => !current);
  }
  
  return (
    <div id="header" className="section">
      <div className="header-inner">
        
        <a href="/" id="logo" alt="Via - go to homepage">
          <svg version="1.1" x="0px" y="0px" viewBox="0 0 21.16664 8.0036713">
            <title>Via Logo</title>
            <g className="letter_v">
              <path className="fill-white" d="M 0.068099,0.254324 H 2.545524 L 2.481794,6.169979 6.464318,0.254324 H 9.068472 L 5.119086,6.611378 C 4.864937,7.0205 4.606384,7.406766 4.18682,7.64467 3.67022,7.937608 3.32946,8.029713 2.62746,7.997601 2.015481,7.969671 1.468001,7.85861 0.994903,7.589239 0.365585,7.23097 0.067462,6.668164 0,6.036045 Z"/>
            </g>
            <g className="letter_i">
              <path className="fill-white" d="m 11.59225,0.254311 h 2.52731 L 9.510675,7.749338 H 6.982997 Z"/>
            </g>
            <g className="letter_a">
              <path className="fill-white" d="m 21.09857,7.749351 h -2.47743 l 0.0637,-5.915671 -3.98252,5.915671 h -2.60416 l 3.94939,-6.35707 c 0.25415,-0.409122 0.5127,-0.795371 0.93226,-1.033292 0.5166,-0.292938 0.85737,-0.385043 1.55937,-0.352914 0.61198,0.02793 1.15945,0.13899 1.63256,0.408345 0.62931,0.358269 0.92743,0.921075 0.9949,1.55321 z"/>
            </g>
          </svg>
        </a>
        
        <div id="navigation">
          <ul className="nav-links">
            <li className="nav-item"><a href="/#/mission/">Mission</a></li>
            <li className="nav-item"><a href="/#/spectrographs/">Spectrographs</a></li>
            <li className="nav-item"><a href="/#/telescopes/">Telescopes</a></li>
            <li className="nav-item"><a href="/#/survey/">Survey</a></li>
            <li className="nav-item"><a href="/#/team/">Team</a></li>
          </ul>
        </div>
        
      </div>
      
      <div id="menu" style={{width: isOpen ? "300px" : "0px"}}>
        <div id="menu-background"></div>
        <div id="menu-navigation" style={{opacity: isOpen ? "1" : "0", visibility: isOpen ? "inherit" : "hidden"}}>
          <ul className="nav-links">
            <li className="nav-item"><a href="/#/mission/">Mission</a></li>
            <li className="nav-item"><a href="/#/spectrographs/">Spectrographs</a></li>
            <li className="nav-item"><a href="/#/telescopes/">Telescopes</a></li>
            <li className="nav-item"><a href="/#/survey/">Survey</a></li>
            <li className="nav-item"><a href="/#/team/">Team</a></li>
          </ul>
        </div>
      </div>
      
      
      <button id="hamburger" role="button" onClick={handleClick}>
        <div id="bar1" className="bar" style={{transform: isOpen ? "translate(0px, 6px) rotate(45deg)" : "translate(0px)"}}></div>
        <div id="bar2" className="bar" style={{width: isOpen ? "0%" : "100%", transform: isOpen ? "translate(12px)" : "translate(0px)"}}></div>
        <div id="bar3" className="bar" style={{transform: isOpen ? "translate(0px, -6px) rotate(-45deg)" : "translate(0px)"}}></div>
      </button>
      
    </div>
  )
}

export default Title
