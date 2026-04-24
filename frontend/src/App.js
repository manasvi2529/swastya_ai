import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import Hospitals from "./pages/Hospitals";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/hospitals" element={<Hospitals />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;