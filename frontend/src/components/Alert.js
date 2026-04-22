import { useEffect, useState } from "react";

function Alert() {
  const [alert, setAlert] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/alert")
      .then(res => res.json())
      .then(data => setAlert(data.alert));
  }, []);

  return (
    <div style={{ textAlign: "center", fontSize: "20px" }}>
      {alert}
    </div>
  );
}

export default Alert;