// Full-viewport section shared by the content pages.
//   bg         full-bleed background image URL
//   plot       alternatively, a plot/diagram image floated on the right over
//              a CSS gradient background (no baked-in background image needed)
//   plotBg     override the plot's CSS background (e.g. "#000")
//   plotWidth  override how much of the section width the plot spans (e.g. "65%")
//   plotRight  inset the plot from the right edge to center it more (e.g. "8%")
//   overlay     optional "gradient" | "optional" overlay div
//   inner       inner-* alignment suffix, e.g. "left-bottom"
//   innerStyle  optional inline style on the inner container
//   sectionStyle optional inline style on the outer .section (e.g. height)
function Section({ bg, plot, plotBg, plotWidth, plotRight, overlay, inner = 'left-bottom', innerStyle, sectionStyle, children }) {
  return (
    <div className="section" style={sectionStyle}>
      {plot ? (
        <>
          <div className="background section-plot-bg" style={{ background: plotBg }}></div>
          <img className="section-plot" src={plot} alt="" style={{ width: plotWidth, right: plotRight }} />
        </>
      ) : (
        <div className="background" style={{ backgroundImage: `url(${bg})` }}></div>
      )}
      {overlay && <div className={`background-${overlay}`}></div>}
      <div className={`inner-${inner}`} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}

export default Section;
