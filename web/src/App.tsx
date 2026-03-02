import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsPainel from "./components/ProductsPainel";
import MaterialsPainel from "./components/MaterialsPainel";

import "./index.css";
import { useState } from "react"; 

/* const [lastEdited, setLastEdited] = useState<string | null>(null); */




function App() {
  const [responsible, setResponsible] = useState<string>("");
  return (
    <>
      <Navbar />

      <div className="container">
        <div className="left">
          <Suggestions />
        </div>

        <div className="right">
          <ProductsPainel responsible={responsible} />
          <MaterialsPainel responsible={responsible} />
        </div>
      </div>
    </>
  );
}

export default App;