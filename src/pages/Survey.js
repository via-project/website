import Section from '../components/Section';
import { surveys } from '../data/surveys';

function Survey() {
  return (
    <>
      <Section plot="../img/footprint_dark.png" plotBg="#000" plotWidth="60%" plotRight="6%" inner="left-top" innerStyle={{ top: "50%", transform: "translateY(-50%)" }} sectionStyle={{ height: "80vh" }}>
        {/* <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Overview</h4> */}
        <h3 style={{paddingBottom:"5px"}}>Survey Design</h3>
        <p style={{color: "#fff"}}>The primary Via Survey will target stellar streams (blue), dwarf galaxy candidates (purple), cold gas sightlines (yellow), and transient events (red).
        Each field is observed for 1 hour, with some &lsquo;deep&rsquo; fields (faint dwarf galaxies, perturbed regions of streams) observed for up to 10 hours.</p>

        {/* <table className="data">
          <tbody>
            <tr>
              <td>RV accuracy at G = 19 ([Fe/H] = -1<span>/-2</span>)</td><td>{'100 m/s'}<span> / 300 m/s</span></td>
            </tr>
            <tr>
              <td>[Fe/H] accuracy at G = 19 ([Fe/H] = -1<span>/-2</span>)</td><td>{'0.02 dex'}<span> / 0.04 dex</span></td>
            </tr>
          </tbody>
        </table> */}
      </Section>

      <div className="section section--auto" style={{ backgroundColor: "#000", color: "#fff" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0px 30px 90px", textAlign: "left" }}>
          <h4 style={{ textTransform: "uppercase", paddingBottom: "5px" }}>The Via Surveys</h4>
          {surveys.map((s) => (
            <div key={s.title} style={{ marginBottom: "1.8rem" }}>
              <h3 style={{ color: s.color, marginBottom: "0.35rem" }}>{s.title}</h3>
              <p style={{ color: "#ddd", margin: 0, lineHeight: 1.6 }}>{s.description}</p>
            </div>
            // TODO: add ancillary surveys
          ))}
        </div>
      </div>
    </>
  );
}

export default Survey;
