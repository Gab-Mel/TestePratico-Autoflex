import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsPainel from "./components/ProductsPainel";
import MaterialsPainel from "./components/MaterialsPainel";

import "./index.css";
import { useState } from "react"; 



function App() {
  const [responsible, setResponsible] = useState<string>("GabMel");
  const [lastEdited, setLastEdited] = useState<string | null>(null);
  return (
    <>
      <Navbar />

      <div className="container">
        <div className="left">
          <Suggestions responsible={responsible}/>
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