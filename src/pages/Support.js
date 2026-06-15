import SupportEntry from '../components/SupportEntry';
import React, { useEffect, useState } from 'react';

function Support() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('support.json')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Error loading support:', err));
  }, []);

  return (
    <>
      <div id="heading">
        <h2>Supported by</h2>
      </div>

      <div id="support-gallery">
        {data.map((item, index) => (
          <SupportEntry key={index} logo={item.logo} name={item.name} web={item.web} />
        ))}
      </div>
    </>
  );
}

export default Support;
