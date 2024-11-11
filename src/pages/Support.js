import '../App.css';
import Title from '../Title';
import Footer from '../Footer';
import SupportEntry from '../components/SupportEntry'

import React, { useEffect, useState } from 'react';
import xml2js from 'xml2js';

function Support() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Replace 'your-xml-file.xml' with the path to your XML file
    fetch('support.xml')
      .then((response) => response.text())
      .then((xml) => {
        // Parse the XML data into a JavaScript object
        xml2js.parseString(xml, (err, result) => {
          if (err) {
            console.error('Error parsing XML:', err);
          } else {
            // Assuming the XML structure has a root element with child elements
            // that you want to display as a list
            setData(result.support.entity);
          }
        });
      });
  }, []);
  
  return (
    <div id="wrapper">
      <Title />
      
      <div id="heading">
        <h2>Supported by</h2>
      </div>
      
      <div id="support-gallery">
        {data.map((item, index) => (
          <SupportEntry logo={item.logo} name={item.name} web={item.web} />
        ))}
      </div>
      
      <Footer />
    </div>
  );
}

export default Support;
