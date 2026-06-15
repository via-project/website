import Tiles from '../Tiles';

function App() {
  return (
    <>
      <Tiles />
      
      <div className="video-container">
        <iframe className="responsive-iframe" title="The Via Project trailer" src="https://www.youtube.com/embed/CWfUNy6iog4?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      
    </>
  );
}

export default App;
