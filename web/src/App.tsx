import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsPainel from "./components/ProductsPainel";
import MaterialsPainel from "./components/MaterialsPainel";

import "./index.css";

function App() {
  return (
    <>
      <Navbar />

      <div className="container">
        <div className="left">
          <Suggestions />
        </div>

        <div className="right">
          <ProductsPainel />
          <MaterialsPainel />
        </div>
      </div>
    </>
  );
}

export default App;