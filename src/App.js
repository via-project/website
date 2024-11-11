import './App.css';
import Title from './Title';
import Footer from './Footer';
// import Tiles from './Tiles';

function App() {
  return (
    <div id="wrapper">
      <Title />
      
      <div className="section">
        <div className="background" style={{backgroundImage: "url(img/mw_igor_desktop.jpg)"}}></div>
        <div className="inner-left-bottom" style={{textAlign:"center", maxWidth:"100%"}}>
          <h1 style={{textTransform: "uppercase", marginBottom: "13px"}}>The Via Project</h1>
          <h3 style={{textTransform: "uppercase"}}>Frontier of discovery in the Milky Way</h3>
        </div>
      </div>
      
      <div className="section">
        <div className="background" style={{backgroundImage: "url(img/mw_igor_desktop.jpg)"}}>
          <iframe src="https://www.youtube.com/embed/Gwjh5CQiaGU?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
