// Full-viewport section shared by the content pages.
//   bg           full-bleed background image URL
//   plot         a plot/diagram image shown beside the text — a responsive
//                two-column split that stacks vertically on narrow screens
//   plotBg       override the plot section's background (e.g. "#000")
//   plotWidth    optional cap on the figure width (e.g. "80%")
//   overlay      optional "gradient" | "optional" overlay div (bg mode)
//   inner        inner-* alignment suffix, e.g. "left-bottom" (bg mode)
//   innerStyle   optional inline style on the inner container (bg mode)
//   sectionStyle optional inline style on the outer .section
function Section({ bg, plot, plotBg, plotWidth, overlay, inner = 'left-bottom', innerStyle, sectionStyle, children }) {
  if (plot) {
    return (
      <div className="section section--plot">
        <div className="background section-plot-bg" style={{ background: plotBg }}></div>
        <div className="plot-row" style={sectionStyle}>
          <div className="plot-text">{children}</div>
          <div className="plot-figure">
            <img src={plot} alt="" style={{ maxWidth: plotWidth }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={sectionStyle}>
      <div className="background" style={{ backgroundImage: `url(${bg})` }}></div>
      {overlay && <div className={`background-${overlay}`}></div>}
      <div className={`inner-${inner}`} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}

export default Section;
