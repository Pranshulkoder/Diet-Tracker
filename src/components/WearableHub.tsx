import { useState, useEffect } from "react";
import { Share2, Watch, Zap, RefreshCw, Heart, Award, Check, CheckCircle2, Waves, Dumbbell, ShieldAlert } from "lucide-react";
import { WearableDevice, Workout } from "../types";

interface WearableHubProps {
  onSyncWorkout: (workout: Omit<Workout, "id">, steps: number, activeCals: number) => void;
  connectedDevices: WearableDevice[];
  onToggleDevice: (deviceId: string) => void;
}

const HEART_RATE_ZONES = [
  { zone: "Zone 5 (Peak Max)", range: "171+ bpm", intensity: "Very High", desc: "Aerobic capacity & speed focus", color: "bg-red-500", text: "text-red-600" },
  { zone: "Zone 4 (Threshold)", range: "153-170 bpm", intensity: "High", desc: "Lactate threshold builders", color: "bg-orange-500", text: "text-orange-600" },
  { zone: "Zone 3 (Aerobic)", range: "135-152 bpm", intensity: "Medium", desc: "Optimal cardiovascular fitness", color: "bg-yellow-500", text: "text-yellow-600" },
  { zone: "Zone 2 (Endurance)", range: "117-134 bpm", intensity: "Low", desc: "Fat-oxidation & cell endurance", color: "bg-emerald-500", text: "text-emerald-600" },
  { zone: "Zone 1 (Warm-up)", range: "99-116 bpm", intensity: "Active Recovery", desc: "Active recovery and warmup", color: "bg-sky-500", text: "text-sky-600" },
];

export default function WearableHub({ onSyncWorkout, connectedDevices, onToggleDevice }: WearableHubProps) {
  const [activeSimulation, setActiveSimulation] = useState<"running" | "lifting" | "hiit" | null>(null);
  const [simSeconds, setSimSeconds] = useState(0);
  const [simHeartRate, setSimHeartRate] = useState(72);
  const [simCalories, setSimCalories] = useState(0);
  const [simSteps, setSimSteps] = useState(0);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Live heart rate simulator when workout simulation runs
  useEffect(() => {
    let interval: any;
    if (activeSimulation) {
      interval = setInterval(() => {
        setSimSeconds((prev) => prev + 1);
        
        // Dynamic heart-rate pacing depending on activity
        setSimHeartRate((prev) => {
          let target = 72;
          if (activeSimulation === "hiit") target = 165;
          if (activeSimulation === "running") target = 145;
          if (activeSimulation === "lifting") target = 115;
          
          const delta = target - prev;
          const perturbation = Math.round((Math.random() - 0.5) * 6);
          return Math.max(90, Math.min(195, prev + Math.round(delta * 0.1) + perturbation));
        });

        // Calories tick depending on intensity
        setSimCalories((prev) => {
          let rate = 0.1;
          if (activeSimulation === "hiit") rate = 0.22;
          if (activeSimulation === "running") rate = 0.16;
          if (activeSimulation === "lifting") rate = 0.11;
          return Math.round((prev + rate) * 100) / 100;
        });

        // Steps increase only for treadmill/running
        if (activeSimulation === "running") {
          setSimSteps((prev) => prev + Math.round(Math.random() * 2 + 1));
        } else if (activeSimulation === "hiit") {
          setSimSteps((prev) => prev + Math.round(Math.random() * 1.2));
        }

      }, 1000);
    } else {
      setSimSeconds(0);
      setSimHeartRate(72);
      setSimCalories(0);
      setSimSteps(0);
    }
    return () => clearInterval(interval);
  }, [activeSimulation]);

  const handleToggleConnect = (id: string, name: string) => {
    onToggleDevice(id);
    const target = connectedDevices.find(d => d.id === id);
    if (target && !target.isConnected) {
      setSyncFeedback(`Successfully linked ${name} device telemetry sync!`);
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  const handleStartWorkout = (type: "running" | "lifting" | "hiit") => {
    const isAnyConnected = connectedDevices.some(d => d.isConnected);
    if (!isAnyConnected) {
      setSyncFeedback("Please connect at least one wearable (e.g. Garmin, Apple Watch) to start live syncing.");
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }
    setActiveSimulation(type);
    setSimSeconds(0);
    setSimCalories(0);
    setSimSteps(0);
  };

  const handleFinishAndSync = () => {
    if (!activeSimulation) return;

    // Map properties
    let workoutType = "Cardio Run Peak";
    let intensity: "low" | "medium" | "high" = "medium";
    let source: any = "Garmin";

    if (activeSimulation === "hiit") {
      workoutType = "Intense HIIT Circuit";
      intensity = "high";
    } else if (activeSimulation === "lifting") {
      workoutType = "Strength Hypertrophy Lifting";
      intensity = "medium";
    } else {
      workoutType = "Heart Rate Zone 2 Run";
      intensity = "low";
    }

    const firstDevice = connectedDevices.find(d => d.isConnected);
    if (firstDevice) {
      source = firstDevice.name;
    }

    // Report active calories and steps to tracker main state
    onSyncWorkout({
      type: workoutType,
      duration: Math.max(1, Math.round(simSeconds / 6)), // 1 second is 10 minutes for user pacing comfort
      intensity,
      caloriesBurned: Math.max(50, Math.round(simCalories * 20)), // Scale metrics for realistic calorie metrics
      source,
      heartRateAvg: simHeartRate,
      timestamp: new Date().toISOString()
    }, Math.round(simSteps * 30), Math.max(50, Math.round(simCalories * 20)));

    setSyncFeedback(`Synced live ${workoutType} session! Calculated +${Math.round(simCalories * 20)} active energy burned.`);
    setActiveSimulation(null);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const triggerGlobalRefresh = () => {
    const hasConnection = connectedDevices.some(d => d.isConnected);
    if (!hasConnection) {
      setSyncFeedback("No linked sensors are connected to pull background data. Connect a wearable first.");
      setTimeout(() => setSyncFeedback(null), 3500);
      return;
    }

    setIsSyncingGlobal(true);
    setSyncFeedback("Pairing visual health stream with peripheral sensors...");

    setTimeout(() => {
      setIsSyncingGlobal(false);
      // Auto report baseline daily activity steps to daily metrics
      const baselineSteps = Math.round(3000 + Math.random() * 2500);
      const baselineActiveCals = Math.round(150 + Math.random() * 120);

      onSyncWorkout({
        type: "Daily Baseline Steps Sync",
        duration: 120,
        intensity: "low",
        caloriesBurned: baselineActiveCals,
        source: connectedDevices.find(d => d.isConnected)?.name || "Apple Watch",
        timestamp: new Date().toISOString()
      }, baselineSteps, baselineActiveCals);

      setSyncFeedback(`Successfully synchronized baseline steps (+${baselineSteps} steps / +${baselineActiveCals} kcal burned).`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 2000);
  };

  const currentDevice = connectedDevices.find(d => d.isConnected);

  return (
    <div className="bg-vibrant-card rounded-[2rem] p-6 border border-vibrant-border shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-vibrant-cyan/10 text-vibrant-cyan rounded-2xl">
              <Watch id="wearable-icon-device" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Wearable Device Integration</h2>
              <p className="text-xs text-zinc-500">Sync heart rate tracking, steps & active expenditure instantly.</p>
            </div>
          </div>
        </div>

        <button
          id="global-wearable-refresh-btn"
          onClick={triggerGlobalRefresh}
          disabled={isSyncingGlobal}
          className="px-5 py-3 h-11 border border-vibrant-cyan/30 text-vibrant-cyan rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-vibrant-cyan/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer bg-zinc-900"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncingGlobal ? "animate-spin text-vibrant-cyan" : ""}`} />
          <span>Sync Device Telemetry</span>
        </button>
      </div>

      {syncFeedback && (
        <div className="p-4 bg-vibrant-cyan/10 text-vibrant-cyan text-xs font-bold rounded-2xl flex items-center gap-2 border border-vibrant-cyan/20 animate-fadeIn shadow-xs font-sans">
          <Award className="w-4 h-4 text-vibrant-cyan shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Connected devices selection grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {connectedDevices.map((d) => (
          <div
            key={d.id}
            id={`device-card-${d.id}`}
            className={`p-4 rounded-2xl border transition-all duration-300 relative ${
              d.isConnected
                ? "border-vibrant-cyan bg-vibrant-cyan/10"
                : "border-vibrant-border bg-zinc-900/40 hover:border-zinc-800"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="text-xl">
                {d.id === "apple-health" && ""}
                {d.id === "google-fit" && "🤖"}
                {d.id === "fitbit" && "💎"}
                {d.id === "garmin" && "⛰️"}
              </div>
              <span
                className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  d.isConnected ? "bg-vibrant-cyan/15 text-vibrant-cyan" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {d.isConnected ? "Synced" : "Offline"}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-white">{d.name}</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">{d.brand}</p>
            </div>

            <button
              id={`toggle-device-btn-${d.id}`}
              onClick={() => handleToggleConnect(d.id, d.name)}
              className={`w-full mt-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all leading-none cursor-pointer border ${
                d.isConnected
                  ? "bg-vibrant-pink/10 text-vibrant-pink border-vibrant-pink/20 hover:bg-vibrant-pink/20"
                  : "bg-vibrant-lime text-black border-transparent hover:bg-[#8ee00f]"
              }`}
            >
              {d.isConnected ? "Disconnect" : "Link Sync"}
            </button>
          </div>
        ))}
      </div>

      {/* Simulated Live Workout Panel */}
      <div className="bg-[#0b0b0d] rounded-3xl p-5 border border-vibrant-border space-y-4 font-sans">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-vibrant-border pb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
              <Zap className="w-4 h-4 text-vibrant-lime animate-pulse" /> Simulate Real-time Training Window
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Activate a live training test block to watch heart-rate zones & calories auto-adapt.</p>
          </div>

          {!activeSimulation ? (
            <div className="flex flex-wrap gap-2">
              <button
                id="sim-run-btn"
                onClick={() => handleStartWorkout("running")}
                className="px-3.5 py-2.5 bg-zinc-900 text-zinc-300 hover:text-vibrant-lime border border-vibrant-border hover:border-vibrant-lime/40 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>🏃 Zone 2 Run</span>
              </button>
              <button
                id="sim-hiit-btn"
                onClick={() => handleStartWorkout("hiit")}
                className="px-3.5 py-2.5 bg-zinc-900 text-zinc-300 hover:text-vibrant-pink border border-vibrant-border hover:border-vibrant-pink/40 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>🔥 Zone 5 HIIT</span>
              </button>
              <button
                id="sim-lift-btn"
                onClick={() => handleStartWorkout("lifting")}
                className="px-3.5 py-2.5 bg-zinc-900 text-zinc-300 hover:text-vibrant-cyan border border-vibrant-border hover:border-vibrant-cyan/40 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>🏋️ Hypertrophy Lift</span>
              </button>
            </div>
          ) : (
            <button
              id="stop-sim-and-sync-btn"
              onClick={handleFinishAndSync}
              className="px-5 py-2.5 bg-vibrant-lime hover:bg-[#8ee00f] text-black rounded-xl text-xs font-black uppercase tracking-tighter transition-all shadow-[0_0_12px_rgba(163,255,18,0.2)] flex items-center gap-1.5 cursor-pointer leading-none"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Conclude & Sync Workout</span>
            </button>
          )}
        </div>

        {/* Live workout ticker display */}
        {activeSimulation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-vibrant-border animate-pulse">
            <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-vibrant-border pb-3 md:pb-0">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Workout Category</span>
              <span className="text-sm font-black text-white capitalize flex items-center gap-1 mt-1 leading-none">
                <Dumbbell className="w-4 h-4 text-vibrant-cyan" /> {activeSimulation} Simulation
              </span>
              <span className="text-[9px] text-vibrant-cyan mt-1 font-bold">Sensor Active ({currentDevice?.name || "Device"})</span>
            </div>

            <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-vibrant-border pb-3 md:pb-0">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Heart Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <Heart className="w-4 h-4 text-vibrant-pink animate-[ping_1s_infinite] shrink-0 self-center" />
                <span className="text-xl font-mono font-black text-white leading-none">{simHeartRate}</span>
                <span className="text-[10px] text-zinc-500 font-bold font-mono">BPM</span>
              </div>
              <span className={`text-[9px] font-bold mt-1 ${
                simHeartRate > 170 ? "text-vibrant-pink" : simHeartRate > 150 ? "text-vibrant-pink/80" : "text-vibrant-lime"
              }`}>
                {simHeartRate > 170 ? "Zone 5 (Anaerobic)" : simHeartRate > 150 ? "Zone 4 (Vigorous)" : "Zone 2-3 (Aerobic)"}
              </span>
            </div>

            <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-vibrant-border pb-3 md:pb-0">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider text-left">EST. Energy Burnt</span>
              <span className="text-xl font-mono font-black text-white mt-1 leading-none">{Math.round(simCalories * 20)} <span className="text-[10px] text-zinc-500 font-bold font-sans">kcal</span></span>
              <span className="text-[9px] text-zinc-550 mt-1">{simCalories} cals/sec expenditure</span>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Dynamic Pedometer</span>
              <span className="text-xl font-mono font-black text-white mt-1 leading-none">+{Math.round(simSteps * 30)} <span className="text-[10px] text-zinc-500 font-bold font-sans">steps</span></span>
              <span className="text-[9px] text-zinc-550 mt-1">Automatic cadence calculation</span>
            </div>
          </div>
        )}
      </div>

      {/* Heart rate training zones guide */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
          <Waves className="w-4 h-4 text-vibrant-cyan hover:animate-bounce" /> Cardiovascular Intensity Reference Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-sans">
          {HEART_RATE_ZONES.map((hr, idx) => (
            <div key={idx} className="bg-zinc-900/50 p-4 rounded-2xl border border-vibrant-border flex flex-col justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  idx === 0 ? "bg-vibrant-pink animate-ping" : idx === 1 ? "bg-vibrant-pink" : idx === 2 ? "bg-vibrant-cyan" : "bg-vibrant-lime"
                }`} />
                <span className="text-[10px] font-black text-zinc-350 leading-none">{hr.zone}</span>
              </div>
              <p className="text-xs font-black mt-2 font-mono text-white leading-none">{hr.range}</p>
              <p className="text-[9px] text-zinc-500 leading-tight mt-1.5">{hr.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
