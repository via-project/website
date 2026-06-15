import Section from '../components/Section';

function Spectrographs() {
  return (
    <>
      <Section bg="../img/system_design.png" overlay="optional" inner="left-bottom">
        <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Overview</h4>
        <h3 style={{paddingBottom:"5px"}}>System Design</h3>
        <p>Viaspec has three main systems: (1) the fiber positioner, mounted at the f/5 Cassegrain focus and attached to the primary mirror cell with six struts, (2) a ~25m run of optical fibers from the fiber positioner to the spectrograph, kept short to minimize throughput losses, and (3) the bench spectrograph, mounted on a cart for convenient storage, and parked on the telescope platform.</p>
        <p>In addition, Viaspec will have a camera-based metrology system to provide iterative fiber positioning feedback, guiders and wavefront sensors, and a set of fixed fibers that can be sent to additional spectrographs, possibly serving exoplanet or transient research.</p>
      </Section>

      <Section bg="../img/viaspec_fps_med.png" overlay="optional" inner="left-bottom">
        <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Component</h4>
        <h3 style={{paddingBottom:"5px"}}>Focal Plane System</h3>
        <p>Viaspec will be fed by 600 robotic fibers, positioned in the focal plane by vertically-oriented actuators. This configuration allows nearly simultaneous positioning of all fibers, and features high fault tolerance. Optical fibers will travel on the neutral axis of a controlled-radius cable carrier in the fiber derotator, and between the fiber positioner and the bench spectrograph.</p>
        <table className="data">
          <tbody>
            <tr>
              <td>Fiber size</td><td>1.15"<span> / 0.2mm</span></td>
            </tr>
            <tr>
              <td>Patrol region</td><td>155"<span> / 25.9mm</span></td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section bg="../img/viaspec_optics_med.png" overlay="optional" inner="left-top">
        <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Component</h4>
        <h3 style={{paddingBottom:"5px"}}>Bench Spectrograph</h3>
        <p>Viaspec will have a 260 mm beam spectrograph to accommodate 600 fibers, which will be located in a gravity-invariant, thermally stable enclosure. It will employ a binary grating that spans the spectral region between the Mgb triplet (for precise radial velocity measurement) and the NaD doublet (for detecting interstellar gas) with a uniformly high efficiency of ~90%. The camera has six optical elements and produces a high-quality image on a single large-frame CCD.</p>
        <table className="data">
          <tbody>
            <tr>
              <td>Resolution</td><td>15,000</td>
            </tr>
            <tr>
              <td>Binary grating</td><td>2,000 lpm</td>
            </tr>
            <tr>
              <td>Spectral coverage</td><td>{'510 nm — 595 nm'}</td>
            </tr>
            <tr>
              <td>CCD format</td><td>9K x 9K<span>{' / 10μm pixels'}</span></td>
            </tr>
          </tbody>
        </table>
      </Section>

    </>
  );
}

export default Spectrographs;
