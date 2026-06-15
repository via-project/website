import '../App.css';

// Full-viewport background section shared by the content pages.
//   bg         image URL used for the background
//   overlay    optional "gradient" | "optional" overlay div
//   inner      inner-* alignment suffix, e.g. "left-bottom"
//   innerStyle optional inline style on the inner container
function Section({ bg, overlay, inner = 'left-bottom', innerStyle, children }) {
  return (
    <div className="section">
      <div className="background" style={{ backgroundImage: `url(${bg})` }}></div>
      {overlay && <div className={`background-${overlay}`}></div>}
      <div className={`inner-${inner}`} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}

export default Section;
