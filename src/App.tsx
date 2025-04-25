import "./App.css";
import Combobox from "./components/Combobox/Combobox";
import { options } from "./data";

function App() {
  return (
    <div className="app">
      <h1>React Combobox</h1>
      <Combobox
        options={options}
        placeholder="Select Option"
        id="single-fruit-combobox"
        label="Single Select"
      />

      <Combobox
        options={options}
        placeholder="Select Options"
        id="multi-fruit-combobox"
        isMulti={true}
        label="Multi Select"
      />
    </div>
  );
}

export default App;
