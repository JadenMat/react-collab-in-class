import { useEffect, useRef, useState } from "react";
import "./Canvas.css";
import { socket } from "../socket.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Canvas({
  brushColor, setBrushColor,
  brushSize, setBrushSize
}) {

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState(null);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  // Handle socket draw updates
  useEffect(() => {
    socket.on("draw", ({ x1, y1, x2, y2, color, size }) => {
      const ctx = ctxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    socket.on("clear", () => {
      const canvas = canvasRef.current;
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  // Drawing handlers
  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setPrevPos({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setPrevPos(null);
  };

  const draw = (e) => {
    if (!isDrawing || !prevPos) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(prevPos.x, prevPos.y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    socket.emit("draw", {
      x1: prevPos.x,
      y1: prevPos.y,
      x2: offsetX,
      y2: offsetY,
      color: brushColor,
      size: brushSize,
    });

    setPrevPos({ x: offsetX, y: offsetY });
  };

  const handleSavePdf = async () => {
    const canvasImage = await html2canvas(canvasRef.current);
    const imgData = canvasImage.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("canvas_export.pdf");
  };

  // Reset canvas
  const handleResetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("clear");
  };

  return (
    <div className="canvas-container">
      <header className="header">
        <h1>Collaborative Drawing Board</h1>
      </header>
  
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          className="drawing-canvas"
        />
      </div>

      <div className="toolbar">
  <label>
    Brush Color:
    <input
      type="color"
      value={brushColor}
      onChange={(e) => setBrushColor(e.target.value)}
    />
  </label>

  <label>
    Brush Size:
    <input
      type="range"
      min="1"
      max="50"
      value={brushSize}
      onChange={(e) => setBrushSize(Number(e.target.value))}
    />
    <span>{brushSize}px</span>
  </label>
</div>

  
      <div className="buttons">
        <button className="pdf" onClick={handleSavePdf}>
          Save as PDF
        </button>
        <button className="reset" onClick={handleResetCanvas}>
          Reset Canvas
        </button>
      </div>
    </div>
  );  
}