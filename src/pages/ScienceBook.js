// TODO (content): replace the summary and add the arXiv link once the book is
// on arXiv (re-enable the commented-out button below).
const PDF_URL = "doc/Via_Science_Book.pdf";
// const ARXIV_URL = "https://arxiv.org/abs/XXXX.XXXXX"; // re-enable with the arXiv button below

const btn = {
  display: "inline-block",
  padding: "0.7rem 1.5rem",
  border: "1px solid #888",
  borderRadius: "4px",
  color: "#fff",
  textDecoration: "none",
  font: "15px/1 Sarabun-SemiBold, Arial, Verdana, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function ScienceBook() {
  return (
    <div className="section section--auto section--center">
      <div className="background" style={{ backgroundImage: "url(../img/mw_igor_desktop.jpg)" }}></div>
      <div className="background-dim"></div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "auto", marginBottom: "auto" }}>
        <div id="heading">
          <h2>Science Book</h2>
        </div>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 30px 90px", color: "#fff", textAlign: "left" }}>
          <p style={{ color: "#ddd", lineHeight: 1.7 }}>
            The Science Book lays out Via's scientific motivation, instrument design, and
            survey strategy.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", margin: "2rem 0" }}>
            <a style={{ ...btn, background: "#fff", color: "#000", borderColor: "#fff" }} href={PDF_URL} target="_blank" rel="noopener noreferrer">Read the PDF</a>
            {/* arXiv button — re-enable (with ARXIV_URL above) once the book is on arXiv:
            <a style={btn} href={ARXIV_URL} target="_blank" rel="noopener noreferrer">View on arXiv</a>
            */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScienceBook;
