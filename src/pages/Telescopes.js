import Section from '../components/Section';

function Telescopes() {
  return (
    <>
      <Section bg="../img/mmt_panorama_igor_med.jpg" inner="left-top">
        <h4 style={{textTransform:"uppercase"}}>Arizona</h4>
        <h3>MMT</h3>
        <p style={{color: "#fff"}}>Via builds upon the legacy of Hectochelle in bringing world-leading wide-field, high-resolution, fiber-fed spectroscopy to the 6.5m MMT. The <a href="https://www.mmto.org/">MMT Observatory</a> is a joint facility of the Smithsonian Institution and the University of Arizona.</p>

        <table className="data">
          <tbody>
            <tr>
              <td>Latitude</td><td>{'31° 41\' 18" N'}</td>
            </tr>
            <tr>
              <td>Longitude</td><td>{'110° 53\' 06" W'}</td>
            </tr>
            <tr>
              <td>Altitude</td><td>2,616 m</td>
            </tr>
            <tr>
              <td>Median seeing</td><td>0.8"</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section bg="../img/lco_colcorr_igor_med.jpg" inner="left-top">
        <h4 style={{textTransform:"uppercase"}}>Chile</h4>
        <h3>Magellan</h3>
        <p style={{color: "#fff"}}>Via will be mounted at the f/5 focus of the 6.5m Magellan/Clay telescope, which has the identical 1 degree field-of-view to the MMT. Operated by the Carnegie Institution for Science at the <a href="https://www.lco.cl/">Las Campanas Observatory</a>.</p>

        <table className="data">
          <tbody>
            <tr>
              <td>Latitude</td><td>{'29° 00\' 57" S'}</td>
            </tr>
            <tr>
              <td>Longitude</td><td>{'70° 41\' 31" W'}</td>
            </tr>
            <tr>
              <td>Altitude</td><td>2,380 m</td>
            </tr>
            <tr>
              <td>Median seeing</td><td>0.6"</td>
            </tr>
          </tbody>
        </table>
      </Section>

    </>
  );
}

export default Telescopes;
