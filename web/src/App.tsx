import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsPainel from "./components/ProductsPainel";
import MaterialsPainel from "./components/MaterialsPainel";
import { useEffect, useState } from "react";

import "./index.css";

type User = {
  username: string;
  role: string;
};


function App() {
  const [responsible, setResponsible] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [lastMaterialEditedOn, setLastMaterialEditedOn] = useState<string | null>(null);
  const [lastProductEditedOn, setLastProductEditedOn] = useState<string | null>(null);

  useEffect(() => {
    if (responsible)
      localStorage.setItem("user", JSON.stringify(responsible));
    else
      localStorage.removeItem("user");
  }, [responsible]);
  return (
    <>
      <div className="app">
        <Navbar 
          responsible={responsible?.username ?? null}
          setResponsible={setResponsible}
        />

        <div className="container">
          <div className="left">
            <Suggestions 
              responsible={responsible?.username ?? null}
              lastMaterialEditedOn={lastMaterialEditedOn}
              lastProductEditedOn={lastProductEditedOn}
              setLastMaterialEditedOn={setLastMaterialEditedOn}
            />
          </div>

          <div className="right">
            <div className="ProductsPainel">
              <ProductsPainel 
                responsible={responsible?.username ?? null} 
                setLastProductEditedOn={setLastProductEditedOn}
              />
            </div>

            <div className="MaterialsPainel">
              <MaterialsPainel 
                responsible={responsible?.username ?? null} 
                setLastMaterialEditedOn={setLastMaterialEditedOn} 
                materialEditedOn={lastMaterialEditedOn}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;