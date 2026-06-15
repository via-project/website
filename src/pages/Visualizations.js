// src/pages/Visualizations.js
import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const logmGrid = [7.0, 7.2, 7.5, 7.8, 8.0];
const rmultGrid = [0.5, 1, 2];
const timpGrid = [-150, -100, -50, 0];

function snapToGrid(value, grid) {
  const v = parseFloat(value);
  return grid.reduce(
    (best, g) => (Math.abs(g - v) < Math.abs(best - v) ? g : best),
    grid[0]
  );
}

function buildFilename(logm, rmult, timp) {
  const timpStr = String(Math.round(timp));
  // rmult must match Python's float formatting (0.5, 1.0, 2.0)
  const rmultStr = Number.isInteger(rmult) ? rmult.toFixed(1) : String(rmult);
  return `sim_data/logm-${logm.toFixed(1)}_rmult-${rmultStr}_timp-${timpStr}.json`;
}

// Standard normal using Box-Muller transform
function randn() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Pick `count` random indices from [0, n) (capped at n), returned sorted.
function subsampleIndices(n, count) {
  const k = Math.min(Math.max(1, count), n);
  const idx = Array.from({ length: n }, (_, i) => i);
  // Partial Fisher-Yates: only the first k positions need to be settled.
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (n - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).sort((a, b) => a - b);
}

// Number of stars with measured radial velocities per survey mode.
const VIA_NSTARS = 4000; // G < 21
const CURRENT_NSTARS = 1000; // G < 19

const Visualizations = () => {
  const [logm, setLogm] = useState(7.5);
  const [rmult, setRmult] = useState(1.0);
  const [timp, setTimp] = useState(-100);

  const [phi1, setPhi1] = useState([]);
  const [phi2, setPhi2] = useState([]);
  const [vrad, setVrad] = useState([]);
  // Bottom-panel arrays (noisy v_rad, possibly sub-sampled to mimic a survey).
  // phi1 is carried alongside so x/y stay index-matched after sub-sampling.
  const [bottomPhi1, setBottomPhi1] = useState([]);
  const [bottomVrad, setBottomVrad] = useState([]);
  const [error, setError] = useState(null);

  const [unpPhi1, setUnpPhi1] = useState([]);
  const [unpPhi2, setUnpPhi2] = useState([]);
  const [unpVrad, setUnpVrad] = useState([]);

  const [noiseMode, setNoiseMode] = useState("0.5"); // "none", "0.5", "5"
  const [noiseKey, setNoiseKey] = useState(0); // increment to resample noise

  // Fetch unperturbed stream once on mount
  useEffect(() => {
    fetch("sim_data/unperturbed.json")
      .then((res) => res.json())
      .then((json) => {
        setUnpPhi1(json.data.phi1 || []);
        setUnpPhi2(json.data.phi2 || []);
        setUnpVrad(json.data.vrad || []);
      })
      .catch((err) => console.error("Could not load unperturbed stream:", err));
  }, []);

  // Fetch simulations when parameters change
  useEffect(() => {
    const snappedLogm = snapToGrid(logm, logmGrid);
    const snappedRmult = snapToGrid(rmult, rmultGrid);
    const snappedTimp = snapToGrid(timp, timpGrid);

    const file = buildFilename(snappedLogm, snappedRmult, snappedTimp);

    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetch(file);
        if (!res.ok) {
          throw new Error(`Could not load ${file} (status ${res.status})`);
        }
        const json = await res.json();

        setPhi1(json.data.phi1 || []);
        setPhi2(json.data.phi2 || []);
        setVrad(json.data.vrad || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setPhi1([]);
        setPhi2([]);
        setVrad([]);
      }
    };

    fetchData();
  }, [logm, rmult, timp]);

  // Build the bottom-panel sample whenever the data, survey mode, or
  // resample key changes: add RV noise and, for "Current Surveys", observe
  // only 25% of the stars.
  useEffect(() => {
    if (!vrad || vrad.length === 0) {
      setBottomPhi1([]);
      setBottomVrad([]);
      return;
    }

    let sigma = 0;
    let count = vrad.length; // Noiseless: every star
    if (noiseMode === "0.5") {
      sigma = 0.5; // Via Survey
      count = VIA_NSTARS;
    }
    if (noiseMode === "5") {
      sigma = 5.0; // Current Surveys
      count = CURRENT_NSTARS;
    }

    const noisy =
      sigma === 0 ? [...vrad] : vrad.map((v) => v + sigma * randn());

    // RVs are measured for `count` of the stars; positions (top panel) are
    // known for all.
    const idx = subsampleIndices(vrad.length, count);
    setBottomPhi1(idx.map((i) => phi1[i]));
    setBottomVrad(idx.map((i) => noisy[i]));
  }, [phi1, vrad, noiseMode, noiseKey]);

  // Derived values for plotting
  const snappedLogm = snapToGrid(logm, logmGrid);
  const snappedRmult = snapToGrid(rmult, rmultGrid);
  const snappedTimp = snapToGrid(timp, timpGrid);

  let noiseSigma = 0;
  if (noiseMode === "0.5") noiseSigma = 0.5;
  if (noiseMode === "5") noiseSigma = 5.0;

  const handleResampleNoise = () => {
    setNoiseKey((k) => k + 1);
  };

  const showErrorBars = noiseSigma > 0;

  return (
    <div
      style={{
        padding: "0.5rem 1.5rem",
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
        Stream Impact Explorer
      </h1>
      <p style={{ fontSize: "0.95rem", color: "#ccc", marginTop: "0" }}>
        Explore a stream&ndash;subhalo interaction as a function of subhalo mass, scale
        radius, time since impact, and RV noise.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1.2rem",
          flexWrap: "wrap",
          marginBottom: "0.6rem",
        }}
      >
        {/* log M_sub slider */}
        <div style={{ minWidth: "180px" }}>
          <label>
            <strong>
              Subhalo Mass
            </strong>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#aaa",
                marginBottom: "0.2rem",
              }}
            >
              Subhalo mass (log&#8321;&#8320;&nbsp;M/M&#9737;)
            </div>
            <input
              type="range"
              min="7"
              max="8"
              step="0.1"
              value={logm}
              onChange={(e) => setLogm(parseFloat(e.target.value))}
            />
          </label>
          <div style={{ marginTop: "0.2rem", fontSize: "0.9rem" }}>
            log&nbsp;M<sub>sub</sub> = {snappedLogm}
          </div>
        </div>

        {/* r_s multiplier button group */}
        <div style={{ minWidth: "220px" }}>
          <strong>
            Subhalo Compactness
          </strong>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#aaa",
              marginBottom: "0.2rem",
            }}
          >
            Scale radius relative to 'cold' DM
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.15rem",
            }}
          >
            {rmultGrid.map((val) => (
              <button
                key={val}
                onClick={() => setRmult(val)}
                style={{
                  padding: "0.3rem 0.8rem",
                  backgroundColor: rmult === val ? "#fff" : "#222",
                  color: rmult === val ? "#000" : "#fff",
                  border:
                    rmult === val ? "1px solid #fff" : "1px solid #555",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: rmult === val ? "600" : "400",
                }}
              >
                {val}&times;
              </button>
            ))}
          </div>
          <div style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>
            r<sub>s</sub> multiplier = {snappedRmult}&times;
          </div>
        </div>

        {/* t_impact button group */}
        <div style={{ minWidth: "220px" }}>
          <strong>
            Time Since Impact
          </strong>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#aaa",
              marginBottom: "0.2rem",
            }}
          >
            Time of impact (Myr ago)
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.15rem",
            }}
          >
            {timpGrid.map((val) => (
              <button
                key={val}
                onClick={() => setTimp(val)}
                style={{
                  padding: "0.3rem 0.8rem",
                  backgroundColor: timp === val ? "#fff" : "#222",
                  color: timp === val ? "#000" : "#fff",
                  border:
                    timp === val ? "1px solid #fff" : "1px solid #555",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: timp === val ? "600" : "400",
                }}
              >
                {Math.abs(val)}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>
            t<sub>impact</sub> = {Math.abs(snappedTimp)} Myr ago
          </div>
        </div>

        {/* Survey controls */}
        <div style={{ minWidth: "240px" }}>
          <strong>Survey</strong>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#aaa",
              marginBottom: "0.2rem",
            }}
          >
            Mock radial velocity observation in bottom panel
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <label>
              <input
                type="radio"
                name="noiseMode"
                value="none"
                checked={noiseMode === "none"}
                onChange={(e) => setNoiseMode(e.target.value)}
              />{" "}
              Noiseless
            </label>
            <label>
              <input
                type="radio"
                name="noiseMode"
                value="5"
                checked={noiseMode === "5"}
                onChange={(e) => setNoiseMode(e.target.value)}
              />{" "}
              Current Surveys{" "}
              <span style={{ color: "#aaa" }}>
                (&sigma;<sub>RV</sub> = 5 km/s, G &lt; 19)
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="noiseMode"
                value="0.5"
                checked={noiseMode === "0.5"}
                onChange={(e) => setNoiseMode(e.target.value)}
              />{" "}
              Via Survey{" "}
              <span style={{ color: "#aaa" }}>
                (&sigma;<sub>RV</sub> = 0.5 km/s, G &lt; 21)
              </span>
            </label>
          </div>
          <button
            onClick={handleResampleNoise}
            style={{
              marginTop: "0.5rem",
              padding: "0.25rem 0.75rem",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Resample noise
          </button>
          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "0.85rem",
              color: "#aaa",
            }}
          >
            Current &sigma;<sub>RV</sub> = {noiseSigma.toFixed(1)} km/s
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: "salmon", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      <Plot
        data={[
          // Unperturbed stream (background)
          {
            x: unpPhi1,
            y: unpPhi2,
            mode: "markers",
            type: "scattergl",
            marker: { size: 3, color: "#444444" },
            name: "unperturbed",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: unpPhi1,
            y: unpVrad,
            mode: "markers",
            type: "scattergl",
            marker: { size: 3, color: "#444444" },
            name: "unperturbed",
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
          },
          // Top panel: phi1 vs phi2 (perturbed)
          {
            x: phi1,
            y: phi2,
            mode: "markers",
            type: "scattergl",
            marker: {
              size: 4,
              color: "#ffffff",
            },
            name: "perturbed",
            xaxis: "x",
            yaxis: "y",
          },
          // Bottom panel: phi1 vs vrad (noisy) with optional error bars
          {
            x: bottomPhi1,
            y: bottomVrad,
            mode: "markers",
            type: "scattergl",
            marker: {
              size: 4,
              color: "#ffffff",
            },
            name: "perturbed",
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
            error_y: {
              type: "constant",
              value: noiseSigma,
              visible: showErrorBars,
              color: "#aaaaaa",
              thickness: 1,
              width: 0,
            },
          },
        ]}
        layout={{
          paper_bgcolor: "#000000",
          plot_bgcolor: "#000000",
          font: { color: "#ffffff" },
          grid: {
            rows: 2,
            columns: 1,
            pattern: "independent",
            roworder: "top to bottom",
          },
          xaxis: {
            title: { text: "Along-stream angle \u03C6\u2081 (deg)", font: { color: "#ffffff" } },
            range: [-15, 15],
            color: "#ffffff",
            showgrid: false,
          },
          yaxis: {
            title: { text: "Across-stream angle \u03C6\u2082 (deg)", font: { color: "#ffffff" } },
            range: [-3, 3],
            color: "#ffffff",
            showgrid: false,
          },
          xaxis2: {
            title: { text: "Along-stream angle \u03C6\u2081 (deg)", font: { color: "#ffffff" } },
            matches: "x",
            range: [-15, 15],
            color: "#ffffff",
            showgrid: false,
          },
          yaxis2: {
            title: { text: "Radial Velocity (km/s)", font: { color: "#ffffff" } },
            range: [-20, 15],
            color: "#ffffff",
            showgrid: false,
          },
          margin: { l: 80, r: 20, t: 50, b: 60 },
          showlegend: true,
          legend: {
            font: { color: "#ffffff" },
            bgcolor: "rgba(0,0,0,0)",
            x: 1,
            xanchor: "right",
            y: 1,
            yanchor: "top",
          },
        }}
        style={{ width: "100%", height: "550px" }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default Visualizations;
