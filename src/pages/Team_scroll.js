import '../App.css';
import Title from '../Title';
import { useState } from 'react';

function App() {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (event) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div id="wrapper">
      <Title />
      <div id="scroller" onScroll={handleScroll}>
        <div className="section">
          <div className="background" style={{backgroundImage: "url(../img/us_night_med.jpg)"}}></div>
          <div className="inner-center-bottom">
            <h1>A Collaboration</h1>
            <h4 style={{textTransform:"uppercase", paddingTop:"10px"}}>{'Carnegie Observatories \u2022 Center for Astrophysics \u2022 University of Arizona'}</h4>
          </div>
        </div>
        
        
        <div className="section">
          <div className="background" style={{backgroundImage: "url(../img/mw_igor_desktop.jpg)"}}></div>
          <div className="inner-center-bottom">
            <h1>A Collaboration</h1>
            <h4 style={{textTransform:"uppercase", paddingTop:"10px"}}>{'Carnegie Observatories \u2022 Center for Astrophysics \u2022 University of Arizona'}</h4>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
