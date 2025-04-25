import "./App.css";
import Combobox from "./components/Combobox/Combobox";
import { options } from "./data";

function App() {
  return (
    <div className="app">
      <h1>React Combobox</h1>
      <Combobox
        options={options}
        placeholder="Select an option"
        id="single-fruit-combobox"
      />

      <Combobox
        options={options}
        placeholder="Select multiple options"
        id="multi-fruit-combobox"
        isMulti={true}
      />
    </div>
  );
}

export default App;
