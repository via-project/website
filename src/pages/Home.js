import '../App.css';
import Title from '../Title';
import Tiles from '../Tiles';
import Footer from '../Footer';

function App() {
  return (
    <div id="wrapper">
      <Title />
      <Tiles />
      
      <div className="video-container">
        <iframe className="responsive-iframe" src="https://www.youtube.com/embed/Gwjh5CQiaGU?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
