import '../App.css';
import Title from '../Title';
import Footer from '../Footer';

function Team() {
  return (
    <div id="wrapper">
      <Title />
        <div className="section">
          <div className="background" style={{backgroundImage: "url(../img/us_night_med.jpg)"}}></div>
          <div className="inner-center-bottom" style={{bottom:"2%"}}>
            <h1>A Collaboration</h1>
            <h4 style={{textTransform:"uppercase", paddingTop:"10px"}}>{'Carnegie Observatories \u25cf Center for Astrophysics \u25cf Stanford \u25cf Yale'}</h4>
          </div>
        </div>
        
        <div className="section">
          <div className="background" style={{backgroundImage: "url(../img/parts_med.jpg)"}}></div>
          <div className="background-gradient"></div>
          
          <div className="inner-left-bottom" style={{maxWidth:"580px"}}>
            <h3>The Via Team</h3>
            <p style={{color: "#fff"}}>A small group of engineers, project managers, and scientists with experience in building optical spectrographs, focal plane systems, and control and analysis pipelines are the core builders of Via.</p>
            
            <table className="data" style={{width:"85%", marginLeft:"10px"}}>
              <tbody>
                <tr>
                  <td>PROJECT PIs</td>
                  <td>
                    <a href="https://obs.carnegiescience.edu/dr-ana-bonaca-0">Ana Bonaca<span> / Carnegie</span></a>
                    <span style={{paddingTop:"10px", display:"block"}}></span>
                    <a href="https://scholar.harvard.edu/cconroy/home">Charlie Conroy<span> / CfA</span></a>
                  </td>
                </tr>
                <tr>
                  <td>INSTRUMENT PI</td>
                  <td><a href="https://www.cfa.harvard.edu/people/daniel-fabricant">Dan Fabricant<span> / CfA</span></a></td>
                </tr>
              </tbody>
            </table>
            
            <p><span className="team">At Carnegie:</span> Julia Brady, David Cruz, Julian Garcia, Charlie Hull, Jake Nibauer, Jack Piotrowski, Tony Piro, Josh Simon</p>
            
            <p><span className="team">At the CfA:</span> Dan Baldwin, Carl Barcroft, Nelson Caldwell, Phill Cargile, Dan Catropa, Vedant Chandra, Andrew Cline, Liam Connor, Paul Di Re, Peter Doherty, Danielle Frostig, Ben Johnson, Jan Kansky, Vlad Kradinov, Kyle MacKenzie, Brian McLeod, Theo O'Neill, Anya Phillips, Conor Sayres, Andrew Schalk, Ashley Villar, Abby White, Joe Zajac</p>
            
            <p><span className="team">At Stanford:</span> Christian Aganze, Jay Baptista, Susan Clark, Tara Dacunha, Ben Dodge, Phil Mansfield, Viraj Manwadkar, Risa Wechsler</p>
            
            <p><span className="team">At Yale:</span> William Cerny, Marla Geha, Pieter van Dokkum</p>
          </div>
          
        </div>
        
      <Footer />
    </div>
  );
}

export default Team;
