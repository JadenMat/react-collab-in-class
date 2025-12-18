import { useState } from "react";
import Canvas from "./components/Canvas.jsx";

export default function App() {
	//use react states to keep track of our brush color and size
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  return (
    <div>
      <Canvas brushColor={brushColor} setBrushColor={setBrushColor} brushSize={brushSize} setBrushSize={setBrushSize}/>
    </div>
  );
}
