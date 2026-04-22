import { useState } from "react";
import Form from "./components/Form";
import Result from "./components/Result";
import Alert from "./components/Alert";
import Stats from "./components/Stats";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>🩺 EpiGuard</h1>

      <div className="card">
        <Alert />
      </div>

      <div className="card">
        <Form setResult={setResult} />
      </div>

      <div className="card">
        <Result result={result} />
      </div>

      <div className="card">
        <Stats />
      </div>
    </div>
  );
}

export default App;