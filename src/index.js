import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Mission from "./pages/Mission";
import Spectrographs from "./pages/Spectrographs";
import Telescopes from "./pages/Telescopes";
import Survey from "./pages/Survey";
import Team from "./pages/Team";
import Credits from "./pages/Credits";
import Support from "./pages/Support";
import Visualizations from "./pages/Visualizations";


export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Section-based pages share the Title/Footer chrome via Layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mission" element={<Mission />} />
          <Route path="spectrographs" element={<Spectrographs />} />
          <Route path="telescopes" element={<Telescopes />} />
          <Route path="survey" element={<Survey />} />
          <Route path="team" element={<Team />} />
          <Route path="credits" element={<Credits />} />
          <Route path="support" element={<Support />} />
        </Route>
        {/* Visualizations uses its own full-bleed scrolling layout */}
        <Route path="visualizations" element={<Visualizations />} />
      </Routes>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
