import '../App.css';
import MediaEntry from '../components/MediaEntry';
import React, { useEffect, useState } from 'react';

function Credits() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('credits.json')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Error loading credits:', err));
  }, []);

  return (
    <>
      <div id="heading">
        <h2>Media credits</h2>
      </div>

      <div id="credits-gallery">
        {data.map((item, index) => (
          <MediaEntry
            key={index}
            name={item.name}
            source={item.source}
            author={item.author}
            web={item.web}
            description={item.description}
          />
        ))}
      </div>
    </>
  );
}

export default Credits;
