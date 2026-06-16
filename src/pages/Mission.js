import Section from '../components/Section';
import { missionSections } from '../data/mission';

function Mission() {
  return (
    <>
      <div className="section section-compact" style={{ minHeight: "40vh" }}>
        <div className="background" style={{ backgroundImage: "url(../img/mission_tng.jpg)", backgroundPosition: "center top" }}></div>
        <div className="content-below-nav">
          <p className="inspiration">What is the nature of dark matter?<br/>
          What are the limits of galaxy formation?<br/>
          How does gas cycle into and out of galaxies?<br/>
          What powers the most extreme transient events?</p>
        </div>
      </div>

      {missionSections.map(({ bg, overlay, kicker, title, paragraphs }) => (
        <div key={title} className="section section-compact" style={{ minHeight: "50vh" }}>
          <div className="background" style={{ backgroundImage: `url(${bg})` }}></div>
          {overlay && <div className={`background-${overlay}`}></div>}
          <div className="content-below-nav">
            <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>{kicker}</h4>
            <h3 style={{paddingBottom:"5px"}}>{title}</h3>
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      ))}

      <Section plot="../img/Crab_Nebula_wide.jpg" plotBg="#000">
        <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>Science Pillar</h4>
        <h3 style={{paddingBottom:"5px"}}>Characterizing the Transient Universe</h3>
        <p>How do massive stars interact in binaries, shed their outer layers before exploding, and collapse into compact remnants? 
        The most extreme transient events in the night sky probe these questions directly — hydrogen-poor superluminous supernovae (SLSNe), fast blue optical transients (FBOTs), luminous red novae, strongly interacting supernovae, tidal disruption events, and entirely new classes of explosions.</p>
        <p>The Vera Rubin Observatory will transform this field, generating roughly 7 million alerts every night and discovering millions of supernovae, thousands of tidal disruption events, and vast numbers of rarer transients. But Rubin detects these events only photometrically; spectroscopy is what classifies them and reveals their central engines, progenitors, and environments. Low-resolution spectroscopic follow-up with Via's Boombox instrument will turn this flood of discoveries into comprehensive population-level studies of the explosive transient universe.</p>
      </Section>
    </>
  );
}

export default Mission;
