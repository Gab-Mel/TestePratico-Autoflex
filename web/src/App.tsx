import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsPainel from "./components/ProductsPainel";
import MaterialsPainel from "./components/MaterialsPainel";

import "./index.css";
import { useState } from "react"; 



function App() {
  const [responsible, setResponsible] = useState<string>("GabMel");
  const [lastMaterialEditedOn, setLastMaterialEditedOn] = useState<string | null>(null);
  const [lastProductEditedOn, setLastProductEditedOn] = useState<string | null>(null);
  return (
    <>
      <Navbar />

      <div className="container">
        <div className="left">
          <Suggestions 
            responsible={responsible}
            lastMaterialEditedOn={lastMaterialEditedOn}
            lastProductEditedOn={lastProductEditedOn}
            setLastMaterialEditedOn={setLastMaterialEditedOn}
          />
        </div>

        <div className="right">
          <ProductsPainel 
            responsible={responsible} 
            setLastProductEditedOn={setLastProductEditedOn}
          />
          <MaterialsPainel 
            responsible={responsible} 
            setLastMaterialEditedOn={setLastMaterialEditedOn} 
            materialEditedOn={lastMaterialEditedOn}
          />
        </div>
      </div>
    </>
  );
}

export default App;