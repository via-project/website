import Section from '../components/Section';

function Instrument() {
  return (
    <>
      <Section bg="../img/system_design.png" overlay="optional" inner="left-bottom">
        <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Overview</h4>
        <h3 style={{paddingBottom:"5px"}}>System Design</h3>
        <p>Viaspec has four main systems: (1) the fiber positioner, mounted at the f/5 Cassegrain focus and attached to the primary mirror cell with six struts, (2) a ~25m run of optical fibers from the fiber positioner to the spectrograph, kept short to minimize throughput losses, (3) the high-resolution Viaspec bench spectrograph, and (4) the low-resolution Boombox spectrograph.</p>
        <p>In addition, Viaspec will have a camera-based metrology system to provide iterative fiber positioning feedback, guiders and wavefront sensors.</p>
      </Section>

      <Section bg="../img/viaspec_fps_med.png" overlay="optional" inner="left-bottom">
        {/* <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Component</h4> */}
        <h3 style={{paddingBottom:"5px"}}>Focal Plane System</h3>
        <p>The Via focal plane consists of 576 robotic fiber positioners, each with two rotating degrees of freedom covering a 130 arcsecond patrol radius. 
          The focal plane also contains 60 fixed fiducial fibers that are used to calibrate the metrology system, and which serve as sky fibers for Viaspec. 
           Optical fibers travel on the neutral axis of a controlled-radius cable carrier in the fiber derotator, and onto a fiber chain towards the bench spectrograph.</p>
        <table className="data">
          <tbody>
            <tr>
              <td>Field Diameter</td><td>1 deg</td>
            </tr>
            <tr>
              <td>Robotic Positioners</td><td>576</td>
            </tr>
            <tr>
              <td>Fixed Fiducials</td><td>60</td>
            </tr>
            <tr>
              <td>Fiber Size</td><td>1.15"<span> / 200μm</span></td>
            </tr>
            <tr>
              <td>Patrol Region</td><td>132"<span> / 22.9mm</span></td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section plot="../img/viaspec_rays.png" plotBg="#000" plotWidth="75%">
        {/* <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Component</h4> */}
        <h3 style={{paddingBottom:"5px"}}>Viaspec Bench Spectrograph</h3>
        <p>Viaspec is a bench spectrograph that receives 660 fibers (540 from robotic positioners, 60 from fixed fiducial sky fibers, 60 from the continuous wavelength calibration system), located in a gravity-invariant, thermally stable enclosure. It will employ a binary grating that spans the spectral region between the Mgb triplet (for precise radial velocity measurement) and the NaD doublet (for detecting interstellar gas) with a uniformly high grating efficiency. The camera has six optical elements and produces a high-quality image on a single large-frame CCD.</p>
        <table className="data">
          <tbody>
            <tr>
              <td>Resolution</td><td>15,000</td>
            </tr>
            <tr>
              <td>Instrument Throughput</td><td>35%</td>
            </tr>
            <tr>
              <td>Spectral coverage</td><td>{'505 — 595 nm'}</td>
            </tr>
            <tr>
              <td>CCD format</td><td>9000×9000<span>{' / 10μm pixels'}</span></td>
            </tr>
          </tbody>
        </table>
      </Section>

        <Section plot="../img/boombox_cad.png">
        {/* <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Component</h4> */}
        <h3 style={{paddingBottom:"5px"}}>Boombox Spectrograph</h3>
        <p>Boombox is a companion instrument to Viaspec for low-resolution spectroscopy, accepting 36 fibers from the focal plane. The 36 Boombox fibers are arranged throughout the Via focal plane in a spoke design, optimized for targeting flexibility, allowing modest field-center and instrument-rotation offsets. The Boombox spectrograph consists of a two-channel optical system: a blue channel (3600–5900 Å) and a red channel (5700–10100 Å).</p>
        <table className="data">
          <tbody>
            <tr>
              <td>Resolution</td><td>1,000</td>
            </tr>
            <tr>
              <td>Instrument Throughput</td><td>41%</td>
            </tr>
            <tr>
              <td>Spectral coverage</td><td>{'360 — 1010 nm'}</td>
            </tr>
            <tr>
              <td>CCD format</td><td>2048×256 (×2)<span>{' / 15μm pixels'}</span></td>
            </tr>
          </tbody>
        </table>
      </Section>

    </>
  );
}

export default Instrument;
