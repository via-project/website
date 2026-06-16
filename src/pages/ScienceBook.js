import React, { useState } from "react";

// TODO (content): replace the summary, the arXiv link, and the BibTeX below
// with the real values once the book is on arXiv.
const PDF_URL = "doc/Via_Science_Book.pdf";
// const ARXIV_URL = "https://arxiv.org/abs/XXXX.XXXXX"; // re-enable with the arXiv button below

const BIBTEX = `@article{Via2026,
  title         = {The Via Project Science Book},
  author        = {{The Via Collaboration}},
  year          = {2026},
  eprint        = {XXXX.XXXXX},
  archivePrefix = {arXiv},
  primaryClass  = {astro-ph.GA}
}`;

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
  const [copied, setCopied] = useState(false);

  const copyBibtex = () => {
    navigator.clipboard?.writeText(BIBTEX).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
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

        <div style={{ marginTop: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "#aaa", fontSize: "0.85rem" }}>Cite this work (BibTeX)</span>
            <button onClick={copyBibtex} style={{ ...btn, padding: "0.35rem 0.9rem", fontSize: "13px", cursor: "pointer", background: "transparent" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre style={{ background: "#111", border: "1px solid #333", borderRadius: "4px", padding: "1rem", overflowX: "auto", color: "#cdd6f4", font: "13px/1.6 monospace", margin: 0 }}>{BIBTEX}</pre>
        </div>
      </div>
    </>
  );
}

export default ScienceBook;
