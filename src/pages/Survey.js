import '../App.css';
import Title from '../Title';
import Footer from '../Footer';

function App() {
  return (
    <div id="wrapper">
      <Title />
      <div className="section">
        <div className="background" style={{backgroundImage: "url(../img/gaia_gas_med.jpg)"}}></div>
        <div className="inner-center-middle">
          <h1 style={{marginBottom:"50px"}}>The Via survey</h1>
          <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>{'150 nights per year \u25cf 5 years \u25cf 3 million spectra'}</h4>
        </div>
      </div>
      
      <div className="section">
        <div className="background" style={{backgroundImage: "url(../img/survey_footprint_offset_med.png)"}}></div>
        <div className="background-optional"></div>
        
        <div className="inner-left-top">
          <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Overview</h4>
          <h3 style={{paddingBottom:"5px"}}>Survey Design</h3>
          <p style={{color: "#fff"}}>The primary Via Survey will target stellar streams (blue), dwarf galaxy candidates (purple), cold gas sightlines (yellow), and transient events (red). 
          The dwarf galaxies and transient events will primarily be identified by the <a href="https://rubinobservatory.org/">Vera Rubin Observatory</a>. 
          The primary survey will observe each field for 3x20 minutes. 
          Faint dwarf galaxy candidates and perturbed regions of streams will be observed in the deep drilling mode, with total exposure times of up to 8 hours. 
          The analysis pipeline to measure radial velocities, stellar parameters and interstellar gas will be based on the <a href="https://github.com/pacargile/MINESweeper">MINESweeper</a> framework.</p>
          
          <table className="data">
            <tbody>
              <tr>
                <td>RV accuracy at G = 19 ([Fe/H] = -1<span>/-2</span>)</td><td>{'100 m/s'}<span> / 300 m/s</span></td>
              </tr>
              <tr>
                <td>[Fe/H] accuracy at G = 19 ([Fe/H] = -1<span>/-2</span>)</td><td>{'0.02 dex'}<span> / 0.04 dex</span></td>
              </tr>
            </tbody>
          </table>
          
        </div>
        
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
