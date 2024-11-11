import '../App.css';
import Title from '../Title';
import Footer from '../Footer';
import MediaEntry from '../components/MediaEntry'

import React, { useEffect, useState } from 'react';
import xml2js from 'xml2js';

function Credits() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Replace 'your-xml-file.xml' with the path to your XML file
    fetch('credits.xml')
      .then((response) => response.text())
      .then((xml) => {
        // Parse the XML data into a JavaScript object
        xml2js.parseString(xml, (err, result) => {
          if (err) {
            console.error('Error parsing XML:', err);
          } else {
            // Assuming the XML structure has a root element with child elements
            // that you want to display as a list
            setData(result.credits.image);
          }
        });
      });
  }, []);
  
  return (
    <div id="wrapper">
      <Title />
      
      <div id="heading">
        <h2>Media credits</h2>
      </div>
      
      <div id="credits-gallery">
        {data.map((item, index) => (
          <MediaEntry name={item.name} source={item.source} author={item.author} web={item.web} description={item.description} />
        ))}
      </div>
      
      <Footer />
    </div>
  );
}

export default Credits;
