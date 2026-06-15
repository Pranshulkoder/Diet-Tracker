import { useState, useRef, useEffect } from "react";
import { Camera, ScanLine, RotateCcw, Sparkles, Check, Zap, Keyboard, Plus, RefreshCw, AlertCircle, ShoppingBag } from "lucide-react";
import { LoggedFood } from "../types";

interface FoodScannerProps {
  onAddFood: (food: Omit<LoggedFood, "id" | "timestamp">) => void;
}

const DEMO_ITEMS = [
  { barcode: "4008400401829", name: "Classic Hazelnut Spread (Nutella)", calories: 200, protein: 2, carbs: 22, fat: 11, emoji: "🍫" },
  { barcode: "123456789012", name: "Oats & Honey Granola", calories: 240, protein: 5, carbs: 38, fat: 7, emoji: "🥣" },
  { barcode: "098765432109", name: "Grass-Fed Whey Protein Isolate", calories: 120, protein: 25, carbs: 2, fat: 1, emoji: "💪" },
  { barcode: "501154649864", name: "Organic Creamy Peanut Butter", calories: 190, protein: 8, carbs: 6, fat: 16, emoji: "🥜" },
  { barcode: "000000100200", name: "Premium Icelandic Skyr / Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.5, emoji: "🥛" },
  { barcode: "000000300400", name: "Wild Salmon Fillet (Pan-Seared)", calories: 260, protein: 32, carbs: 0, fat: 14, emoji: "🐟" },
];

export default function FoodScanner({ onAddFood }: FoodScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle webcam toggle
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setCameraStream(stream);
      setIsScanningActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setErrorMessage("Unable to access camera. Check device preferences or input typed barcode codes directly.");
      setIsScanningActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanningActive(false);
  };

  // Capture Base64 Snapshot logic
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw active frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract raw base64 data
      const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
      const base64Content = dataUrl.split(",")[1]; // remove prefix meta data

      // Send to server-side visual diet analysis
      const response = await fetch("/api/diet/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Content,
          mimeType: "image/jpeg"
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const resData = await response.json();
      if (resData.isSuccess && resData.data) {
        setScanResult(resData.data);
        setNotification(`AI successfully scanned & analyzed food item from camera target!`);
        stopCamera();
      } else {
        throw new Error("Unstructured response from food image analysis.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to parse camera snapshot. Set target directly or type standard barcodes.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Submits a manually typed barcode
  const handleBarcodeSubmit = async (barcodeToQuery: string) => {
    if (!barcodeToQuery) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const response = await fetch("/api/barcode/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: barcodeToQuery.trim() })
      });

      if (!response.ok) {
        throw new Error("Barcode search returned an error status.");
      }

      const resData = await response.json();
      if (resData.isSuccess && resData.data) {
        setScanResult(resData.data);
        setNotification(`Successfully resolved barcode lookup [${barcodeToQuery}]`);
      } else {
        throw new Error("Unrecognized barcode product registry format.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Barcode scan error: ${err.message || "Failed to recognize item"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Commit parsed results to dietary logs
  const handleConfirmAndAdd = () => {
    if (!scanResult || !scanResult.items || scanResult.items.length === 0) return;

    scanResult.items.forEach((item: any) => {
      onAddFood({
        name: item.name,
        amount: item.amount || "1 portion",
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        category: selectedCategory
      });
    });

    setNotification(`Logged ${scanResult.items.length} item(s) to ${selectedCategory} slot.`);
    setScanResult(null);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-vibrant-card rounded-[2rem] p-6 border border-vibrant-border shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-vibrant-lime/10 text-vibrant-lime rounded-2xl">
            <ScanLine id="barcode-scan-logo" className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">UPC Barcode & Visual Scanner</h2>
            <p className="text-xs text-zinc-550 text-zinc-500">Log packaged products immediately via barcode scanner or visual snaps.</p>
          </div>
        </div>

        {isScanningActive && (
          <button
            id="close-camera-btn"
            onClick={stopCamera}
            className="px-3 py-1.5 bg-vibrant-pink/15 text-vibrant-pink rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-vibrant-pink/25 transition-all cursor-pointer border border-vibrant-pink/20"
          >
            Turn Off Video
          </button>
        )}
      </div>

      {notification && (
        <div className="p-4 bg-vibrant-lime/10 text-vibrant-lime text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn border border-vibrant-lime/20">
          <Check className="w-4 h-4 text-vibrant-lime shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-vibrant-pink/10 text-vibrant-pink text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn border border-vibrant-pink/20">
          <AlertCircle className="w-4 h-4 text-vibrant-pink shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Visual Live Cam Scopes & Capture Canvas */}
      <div className="relative">
        {isScanningActive ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-vibrant-border bg-[#0b0b0d] aspect-[4/3] flex items-center justify-center">
            {/* Camera feed */}
            <video
              id="camera-video-elem"
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Glowing technological scanning elements overlay */}
            <div className="absolute inset-x-8 top-[15%] bottom-[15%] border-2 border-dashed border-vibrant-cyan rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4">
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-vibrant-cyan -mt-1 -ml-1" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-vibrant-cyan -mt-1 -mr-1" />
              </div>

              {/* Laser beam scan anim */}
              <div className="w-full h-0.5 bg-vibrant-lime opacity-80 shadow-[0_0_12px_rgba(163,255,18,1)] animate-[bounce_2s_infinite]" />

              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-vibrant-cyan -mb-1 -ml-1" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-vibrant-cyan -mb-1 -mr-1" />
              </div>
            </div>

            <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2">
              <button
                id="capture-snap-btn"
                onClick={handleCaptureSnapshot}
                disabled={isProcessing}
                className="px-6 py-3.5 bg-vibrant-lime text-black leading-none rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-[#8ee00f] transition-all active:scale-95 shadow-[0_0_15px_rgba(163,255,18,0.3)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Camera className="w-4 h-4 text-black" />
                )}
                <span>Capture & Analyze Food / Barcode</span>
              </button>
            </div>
          </div>
        ) : (
          !scanResult && (
            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-center bg-zinc-900/20">
              <div className="p-4 bg-vibrant-cyan/15 rounded-full mb-3 text-vibrant-cyan">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">No active scan channel</h3>
              <p className="text-xs text-zinc-550 text-zinc-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Connect your actual device video stream to visually extract calories on the fly from barcode plates or food items.
              </p>
              <button
                id="start-camera-scan-btn"
                onClick={startCamera}
                className="px-6 py-3.5 bg-vibrant-lime hover:bg-[#8ee00f] text-black rounded-full shadow-[0_0_12px_rgba(163,255,18,0.2)] text-xs font-black uppercase tracking-tighter transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-black" />
                <span>Open Barcode Scanner Camera</span>
              </button>
            </div>
          )
        )}
        {/* Invisible drawing canvas frame for base64 compilation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Instant Demo Barcode Selection Row */}
      {!scanResult && !isScanningActive && (
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-zinc-550 text-zinc-505 flex items-center gap-1.5 leading-none">
            <ShoppingBag className="w-3.5 h-3.5 text-vibrant-cyan" /> Or pick a demo retail item below to simulate instant scanning:
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DEMO_ITEMS.map((item) => (
              <button
                key={item.barcode}
                type="button"
                id={`demo-scan-${item.barcode}`}
                onClick={() => {
                  setBarcodeInput(item.barcode);
                  handleBarcodeSubmit(item.barcode);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-zinc-900/50 border border-vibrant-border hover:border-vibrant-cyan/50 hover:bg-zinc-900 transition-all active:scale-95"
              >
                <span className="text-lg shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white truncate leading-none">{item.name}</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5 tracking-tight font-mono uppercase"><span className="text-vibrant-lime font-bold">{item.calories}</span> Kcal · P:<span className="text-vibrant-lime font-bold">{item.protein}</span>g</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barcode manual typing input */}
      {!isScanningActive && !scanResult && (
        <div className="flex gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600">
              <Keyboard className="w-4 h-4" />
            </div>
            <input
              id="manual-barcode-input"
              type="text"
              placeholder="Type retail barcode directly (e.g. 123456789012)"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-900 text-white border border-vibrant-border rounded-2xl outline-none focus:ring-2 focus:ring-vibrant-lime/20 focus:border-vibrant-lime text-xs font-semibold placeholder-zinc-550"
            />
          </div>
          <button
            id="barcode-search-btn"
            onClick={() => handleBarcodeSubmit(barcodeInput)}
            disabled={isProcessing || !barcodeInput.trim()}
            className="px-5 py-3 bg-vibrant-lime text-black rounded-2xl text-xs font-black uppercase tracking-tighter hover:bg-[#8ee00f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span>Query Code</span>
            )}
          </button>
        </div>
      )}

      {/* Analysis Preview Cards */}
      {scanResult && (
        <div className="p-5 border border-vibrant-border bg-[#131417] rounded-3xl space-y-4 animate-slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-vibrant-lime font-black uppercase tracking-wider leading-none">
              <Sparkles className="w-4 h-4 text-vibrant-lime shrink-0 animate-bounce" />
              <span>AI SCAN RESULT DETECTED</span>
            </div>
            <button
              id="cancel-scan-btn"
              onClick={() => setScanResult(null)}
              className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer border border-vibrant-border"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2.5">
            {scanResult.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-zinc-900 p-4 rounded-2xl border border-vibrant-border flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                  <p className="text-[11px] text-zinc-550 text-zinc-500 font-medium mt-0.5">Serving size: {item.amount || "1 Portion"}</p>
                </div>

                <div className="flex gap-2 text-center">
                  <div className="bg-vibrant-lime/10 px-2 py-1.5 rounded-lg border border-vibrant-lime/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-lime font-bold">KCAL</span>
                    <span className="text-xs font-black text-white font-mono leading-none mt-0.5 block">{item.calories}</span>
                  </div>
                  <div className="bg-vibrant-lime/5 px-2 py-1.5 rounded-lg border border-vibrant-lime/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-lime font-bold">PRO</span>
                    <span className="text-xs font-black text-vibrant-lime font-mono leading-none mt-0.5 block">{item.protein}g</span>
                  </div>
                  <div className="bg-vibrant-cyan/10 px-2 py-1.5 rounded-lg border border-vibrant-cyan/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-cyan font-bold">CARB</span>
                    <span className="text-xs font-black text-vibrant-cyan font-mono leading-none mt-0.5 block">{item.carbs}g</span>
                  </div>
                  <div className="bg-vibrant-magenta/10 px-2 py-1.5 rounded-lg border border-vibrant-magenta/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-magenta font-bold">FAT</span>
                    <span className="text-xs font-black text-vibrant-magenta font-mono leading-none mt-0.5 block">{item.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestion box */}
          {scanResult.suggestion && (
            <div className="p-4 bg-[#1a1a1e] rounded-2xl border border-vibrant-border text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5 border-l-4 border-l-vibrant-lime">
              <Zap className="w-4 h-4 text-vibrant-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-white">Nutrition Analyst Suggestion:</span> {scanResult.suggestion}
              </div>
            </div>
          )}

          {/* Slots Selector and Confirmation Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-vibrant-border self-start">
              {["breakfast", "lunch", "dinner", "snack"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`slot-${cat}`}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all leading-none ${
                    selectedCategory === cat
                      ? "bg-vibrant-lime text-black font-black italic shadow-xs"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              id="confirm-scanned-food"
              onClick={handleConfirmAndAdd}
              className="px-6 py-3.5 bg-vibrant-lime text-black rounded-full text-xs font-black uppercase tracking-tighter hover:bg-[#8ee00f] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.3)] shrink-0"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Log Visual Items</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
