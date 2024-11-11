import '../App.css';
import Title from '../Title';
import Logo from '../Logo';

function App() {
  return (
    <div id="wrapper">
      <Title />
      <div id="tiles">
        
        <div className="section">
          <div className="knockout" style={{backgroundImage: "url(../img/us_night_med.jpg)"}}>
            <svg className="knockout-text-container" style={{width:"100%", height:"100%", margin:"0px", padding:"0px", backgroundClip:"inherit"}}>
              <rect className="knockout-text-bg" style={{width:"100%", height:"100%", fill:"#000", x:"0", y:"0", fillOpacity:"0.7", mask:"url(#knockout-text)", margin:"0px"}}/>
              <mask id="knockout-text">
                <rect style={{width:"100%", height:"100%", fill:"#fff", x:"0", y:"0", margin:"0px"}}/>
                <svg width="70%" x="0%" y="40%"><use href="#logo"></use></svg>
              </mask>
            </svg>
          </div>
          
          <div className="inner-center-bottom">
            <h4 style={{opacity:1, textTransform:"uppercase"}}>A collaboration between the Carnegie Observatories, Center for Astrophysics, and University of Arizona</h4>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
