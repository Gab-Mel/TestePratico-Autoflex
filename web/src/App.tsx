import Navbar from "./components/Navbar";
import Suggestions from "./components/Suggestions";
import ProductsForm from "./components/ProductsForm";
import MaterialsForm from "./components/MaterialsForm";

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
          <ProductsForm />
          <MaterialsForm />
        </div>
      </div>
    </>
  );
}

export default App;