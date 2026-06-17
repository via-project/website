import { surveys, ancillarySurveys } from '../data/surveys';

function Survey() {
  return (
    <div className="section section--auto">
      <div className="background" style={{ backgroundImage: "url(../img/mw_igor_desktop.jpg)" }}></div>
      <div className="background-dim"></div>

      <div className="survey-content">
        {/* Overview */}
        <div className="survey-col">
          <h3 style={{ paddingBottom: "5px" }}>Survey Design</h3>
          <p style={{ color: "#fff" }}>The Via Survey aims to observe at least 500 nights, combining time at the 6.5m MMT and Magellan/Clay telescopes over five years.
          Each field is observed for 1 hour, with some &lsquo;deep&rsquo; fields (faint dwarf galaxies, perturbed regions of streams) observed for up to 10 hours.
          These key projects will determine the pointing centers for Via Survey observations. In most cases the number of targets associated with each project is far less than the number of fibers available - the remaining fibers will be allocated to a suite of ancillary science cases.</p>
        </div>

        {/* Survey footprint — about half the screen width */}
        <img className="survey-figure" src="../img/footprint_transparent.png" alt="All-sky map of the Via survey footprint and its key projects" />

        {/* The Via Surveys */}
        <div className="survey-col">
          <h4 style={{ textTransform: "uppercase", paddingBottom: "5px" }}>The Via Surveys</h4>
          {surveys.map((s) => (
            <div key={s.title} style={{ marginBottom: "1.8rem" }}>
              <h3 style={{ color: s.color, marginBottom: "0.35rem" }}>{s.title}</h3>
              <p style={{ color: "#ddd", margin: 0, lineHeight: 1.6 }}>{s.description}</p>
            </div>
          ))}

          <h3 style={{ color: "#fff", marginTop: "2.5rem", marginBottom: "0.35rem" }}>Ancillary Surveys</h3>
          <p style={{ color: "#ddd", lineHeight: 1.6, marginBottom: "0.8rem" }}>Spare fibers in every Via pointing will be used to study a wide variety of targets that support a range of ancillary science cases, including but not limited to:</p>
          <ul style={{ color: "#ddd", lineHeight: 1.8, paddingLeft: "1.2rem", marginTop: "0.5rem", fontFamily: "Sarabun-Regular, Arial, Verdana, sans-serif", fontSize: "18px" }}>
            {ancillarySurveys.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Survey;
