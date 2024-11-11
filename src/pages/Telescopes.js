import '../App.css';
import Title from '../Title';
import Footer from '../Footer';

function App() {
  return (
    <div id="wrapper">
      <Title />
      <div className="section">
        <div className="background" style={{backgroundImage: "url(../img/mmt_igor_med.jpg)"}}></div>
        <div className="inner-center-bottom">
          <h1>Eyes on the whole sky</h1>
          <h4 style={{textTransform:"uppercase", paddingTop:"10px"}}>Twin 6.5-meter, wide-field telescopes in Arizona and Chile</h4>
        </div>
      </div>
      
      <div className="section">
        <div className="background" style={{backgroundImage: "url(../img/mmt_panorama_igor_med.jpg)"}}></div>
        <div className="inner-left-top">
          <h4 style={{textTransform:"uppercase"}}>Arizona</h4>
          <h3>MMT</h3>
          <p style={{color: "#fff"}}>Via builds upon the legacy of Hectochelle in bringing world-leading wide-field, high-resolution, fiber-fed spectroscopy to the 6.5m MMT. The <a href="https://www.mmto.org/">MMT Observatory</a> is a joint facility of the Smithsonian Institution and the University of Arizona.</p>
          
          <table className="data">
            <tbody>
              <tr>
                <td>Latitude</td><td>{'31\u00b0 41\' 18" N'}</td>
              </tr>
              <tr>
                <td>Longitude</td><td>{'110\u00b0 53\' 06" W'}</td>
              </tr>
              <tr>
                <td>Altitude</td><td>2,616 m</td>
              </tr>
              <tr>
                <td>Median seeing</td><td>0.8"</td>
              </tr>
            </tbody>
          </table>
          
        </div>
      </div>
      
      <div className="section">
        <div className="background" style={{backgroundImage: "url(../img/lco_colcorr_igor_med.jpg)"}}></div>
        <div className="inner-left-top">
          <h4 style={{textTransform:"uppercase"}}>Chile</h4>
          <h3>Magellan</h3>
          <p style={{color: "#fff"}}>Via will be mounted at the f/5 focus of the 6.5m Magellan/Clay telescope, which has the identical 1deg field-of-view to MMT. Operated by the Carnegie Institution for Science at the <a href="https://www.lco.cl/">Las Campanas Observatory</a>.</p>
          
          <table className="data">
            <tbody>
              <tr>
                <td>Latitude</td><td>{'29\u00b0 00\' 57" S'}</td>
              </tr>
              <tr>
                <td>Longitude</td><td>{'70\u00b0 41\' 31" W'}</td>
              </tr>
              <tr>
                <td>Altitude</td><td>2,380 m</td>
              </tr>
              <tr>
                <td>Median seeing</td><td>0.6"</td>
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
