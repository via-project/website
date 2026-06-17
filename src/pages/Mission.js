import { missionSections } from '../data/mission';

function Mission() {
  return (
    <>
      {/* Flexible top block: sized to its content so the intro text fits
          comfortably on screen with margin, while the pillars below stay full-height. */}
      <div className="section section-compact">
        <div className="background" style={{ backgroundImage: "url(../img/mission_tng.jpg)", backgroundPosition: "center top" }}></div>
        <div className="content-below-nav">
          <p className="inspiration">What is the nature of dark matter?<br/>
          What are the limits of galaxy formation?<br/>
          How does gas cycle into and out of galaxies?<br/>
          What powers the most extreme transient events?</p>
        </div>
      </div>

      {missionSections.map(({ bg, overlay, kicker, title, paragraphs }) => (
        <div key={title} className="section section-compact section-centered" style={{ minHeight: "100vh" }}>
          <div className="background" style={{ backgroundImage: `url(${bg})` }}></div>
          {overlay && <div className={`background-${overlay}`}></div>}
          <div className="content-below-nav">
            <h4 style={{textTransform:"uppercase", paddingBottom:"5px"}}>{kicker}</h4>
            <h3 style={{paddingBottom:"5px"}}>{title}</h3>
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      ))}
    </>
  );
}

export default Mission;
