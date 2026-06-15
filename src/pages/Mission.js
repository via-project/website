import Section from '../components/Section';
import { missionSections } from '../data/mission';

function Mission() {
  return (
    <>
      <Section bg="../img/mission_tng.jpg" inner="left-top">
        <p className="inspiration">What is the nature of dark matter?<br/>
        What are the limits of galaxy formation?<br/>
        How does gas cycle into and out of galaxies?</p>

        <p>The answer to these questions lies in the high-resolution map and motions of stars and gas in the Milky Way, beyond the precision and scope of current astronomical instrumentation.</p>
      </Section>

      {missionSections.map(({ bg, overlay, kicker, title, paragraphs }) => (
        <Section key={title} bg={bg} overlay={overlay} inner="left-bottom">
          <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>{kicker}</h4>
          <h3 style={{paddingBottom:"5px"}}>{title}</h3>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </Section>
      ))}
    </>
  );
}

export default Mission;
