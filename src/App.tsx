import { useState, useEffect } from "react";
import { Dumbbell, Sparkles, Scale, Heart, Utensils, MessageCircleCode, Check, Trash2, Watch, Grid } from "lucide-react";
import { BodyComposition, MacroGoals, LoggedFood, WearableDevice, Workout } from "./types";
import BodyCompForm from "./components/BodyCompForm";
import FoodScanner from "./components/FoodScanner";
import DietAdder from "./components/DietAdder";
import WearableHub from "./components/WearableHub";
import MacroDashboard from "./components/MacroDashboard";
import DailyLog from "./components/DailyLog";
import RecipeDiscovery from "./components/RecipeDiscovery";

// Initial realistic pre-filled parameters for fitness enthusiasts
const INITIAL_BODY_PROFILE: BodyComposition = {
  weight: 78,
  weightUnit: "kg",
  height: 180,
  heightUnit: "cm",
  age: 26,
  gender: "male",
  bodyFat: 15.5,
  muscleMass: 42,
  goal: "fat-loss",
  activityLevel: "moderate"
};

const INITIAL_MACRO_GOALS: MacroGoals = {
  calories: 2050,
  protein: 175,
  carbs: 180,
  fat: 57
};

const INITIAL_LOGGED_FOODS: LoggedFood[] = [
  {
    id: "pre-food-1",
    name: "Grass-Fed Whey Protein Isolate Shake",
    amount: "1 Scoop (30g)",
    calories: 120,
    protein: 25,
    carbs: 2,
    fat: 1,
    category: "snack",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "pre-food-2",
    name: "Classic Oats with Almond Milk & Banana",
    amount: "1 bowl (200g)",
    calories: 340,
    protein: 11,
    carbs: 58,
    fat: 6,
    category: "breakfast",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "pre-food-3",
    name: "Grilled Chicken Breast with White Rice",
    amount: "150g breast, 1 cup rice",
    calories: 442,
    protein: 50,
    carbs: 42,
    fat: 5.6,
    category: "lunch",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_DEVICES: WearableDevice[] = [
  { id: "apple-health", name: "Apple Watch SE", brand: "Apple iOS Sync", isConnected: false, todaySteps: 0, caloriesBurnedActive: 0, averageHr: 72, syncStatus: "idle" },
  { id: "garmin", name: "Garmin Fenix 7 Pro", brand: "Garmin Connect Connect", isConnected: true, todaySteps: 4200, caloriesBurnedActive: 210, averageHr: 72, syncStatus: "idle" },
  { id: "google-fit", name: "Pixel Watch 2", brand: "Google Fit Sync", isConnected: false, todaySteps: 0, caloriesBurnedActive: 0, averageHr: 0, syncStatus: "idle" },
  { id: "fitbit", name: "Fitbit Charge 6", brand: "Fitbit Cloud Service", isConnected: false, todaySteps: 0, caloriesBurnedActive: 0, averageHr: 0, syncStatus: "idle" }
];

export default function App() {
  // Check LocalStorage fallbacks
  const [bodyProfile, setBodyProfile] = useState<BodyComposition>(() => {
    const saved = localStorage.getItem("hdt_body_profile");
    return saved ? JSON.parse(saved) : INITIAL_BODY_PROFILE;
  });

  const [macroGoals, setMacroGoals] = useState<MacroGoals>(() => {
    const saved = localStorage.getItem("hdt_macro_goals");
    return saved ? JSON.parse(saved) : INITIAL_MACRO_GOALS;
  });

  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>(() => {
    const saved = localStorage.getItem("hdt_logged_foods");
    return saved ? JSON.parse(saved) : INITIAL_LOGGED_FOODS;
  });

  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>(() => {
    const saved = localStorage.getItem("hdt_connected_device_state");
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [activeTab, setActiveTab] = useState<"tracker" | "scanner" | "wearables" | "biometrics" | "recipes">("tracker");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("hdt_body_profile", JSON.stringify(bodyProfile));
  }, [bodyProfile]);

  useEffect(() => {
    localStorage.setItem("hdt_macro_goals", JSON.stringify(macroGoals));
  }, [macroGoals]);

  useEffect(() => {
    localStorage.setItem("hdt_logged_foods", JSON.stringify(loggedFoods));
  }, [loggedFoods]);

  useEffect(() => {
    localStorage.setItem("hdt_connected_device_state", JSON.stringify(connectedDevices));
  }, [connectedDevices]);

  // Aggregate active calories burned from connected wearable logs
  const activeCaloriesBurned = connectedDevices
    .filter(d => d.isConnected)
    .reduce((sum, d) => sum + d.caloriesBurnedActive, 0);

  // Total steps
  const totalStepsToday = connectedDevices
    .filter(d => d.isConnected)
    .reduce((sum, d) => sum + d.todaySteps, 0);

  // Add food logic
  const handleAddFood = (foodInfo: Omit<LoggedFood, "id" | "timestamp">) => {
    const newFood: LoggedFood = {
      ...foodInfo,
      id: "food-" + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString()
    };
    setLoggedFoods((prev) => [newFood, ...prev]);
    showToast(`Logged "${foodInfo.name}" successfully.`);
  };

  // Remove food logic
  const handleRemoveFood = (id: string) => {
    setLoggedFoods((prev) => prev.filter((f) => f.id !== id));
    showToast("Removed food log.");
  };

  // Toggle devices linking
  const handleToggleDevice = (deviceId: string) => {
    setConnectedDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextState = !d.isConnected;
          return {
            ...d,
            isConnected: nextState,
            // Reset totals if disconnect, or prefill base stats on linkage
            todaySteps: nextState ? 3400 : 0,
            caloriesBurnedActive: nextState ? 175 : 0
          };
        }
        return d;
      })
    );
  };

  // Handle Wearable Workout synchronization
  const handleSyncWorkout = (workout: Omit<Workout, "id">, steps: number, activeCals: number) => {
    // Add steps and active calories to connected synced device
    setConnectedDevices((prev) => {
      const activeIdx = prev.findIndex(d => d.isConnected);
      if (activeIdx !== -1) {
        return prev.map((d, idx) => {
          if (idx === activeIdx) {
            return {
              ...d,
              todaySteps: d.todaySteps + steps,
              caloriesBurnedActive: d.caloriesBurnedActive + activeCals
            };
          }
          return d;
        });
      }
      return prev;
    });

    showToast(`Synced ${workout.type} metrics!`);
  };

  // Profile parameter adjustments
  const handleProfileChange = (newProfile: BodyComposition, newTargets: MacroGoals) => {
    setBodyProfile(newProfile);
    setMacroGoals(newTargets);
    showToast("Bio-metric target targets calculated & saved!");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-vibrant-bg text-white font-sans selection:bg-vibrant-lime/30">
      
      {/* Prime Header Block */}
      <header className="bg-vibrant-bg/80 backdrop-blur-md border-b border-vibrant-border sticky top-0 z-50 shadow-[0_1px_15px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-vibrant-lime rounded-2xl text-black transform hover:rotate-6 transition-transform">
              <Dumbbell className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-vibrant-lime to-vibrant-cyan leading-none">
                CORE_SYNC
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">High-Efficiency Metabolic Coach</p>
            </div>
          </div>

          {/* Quick Body compos preview in banner */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <div className="bg-vibrant-card px-4 py-2 rounded-full border border-vibrant-border">
              <span className="text-zinc-500 mr-1.5 uppercase text-[9px]">Goal:</span>
              <span className="font-bold text-vibrant-lime uppercase text-[10px] tracking-wider">
                {bodyProfile.goal === "fat-loss" ? "Cut (Fat Loss)" : bodyProfile.goal === "muscle-gain" ? "Lean Bulk" : bodyProfile.goal === "recomposition" ? "Body Recomp" : "Maintenance"}
              </span>
            </div>
            <div className="bg-vibrant-card px-4 py-2 rounded-full border border-vibrant-border">
              <span className="text-zinc-500 mr-1.5 uppercase text-[9px]">Weight:</span>
              <span className="font-bold text-white text-[10px]">{bodyProfile.weight} {bodyProfile.weightUnit}</span>
            </div>
            <div className="bg-zinc-900 border border-vibrant-border text-vibrant-lime px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-vibrant-lime rounded-full animate-ping"></span>
              <span>AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tab rail */}
        <div className="flex justify-start border border-vibrant-border border-l-4 border-l-vibrant-lime bg-vibrant-card p-3 rounded-2xl overflow-x-auto gap-2">
          <button
            id="tab-tracker-btn"
            onClick={() => setActiveTab("tracker")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "tracker"
                ? "bg-vibrant-lime text-black shadow-sm font-black italic"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span>Macro Progress Tracker</span>
          </button>

          <button
            id="tab-scanner-btn"
            onClick={() => setActiveTab("scanner")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "scanner"
                ? "bg-vibrant-lime text-black shadow-sm font-black italic"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Utensils className="w-4 h-4 shrink-0" />
            <span>AI Food Camera & Barcode Scanner</span>
          </button>

          <button
            id="tab-recipes-btn"
            onClick={() => setActiveTab("recipes")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "recipes"
                ? "bg-vibrant-lime text-black shadow-sm font-black italic"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>AI Recipe Hub</span>
          </button>

          <button
            id="tab-wearables-btn"
            onClick={() => setActiveTab("wearables")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "wearables"
                ? "bg-vibrant-lime text-black shadow-sm font-black italic"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Watch className="w-4 h-4 shrink-0" />
            <span>Wearables Integration Hub</span>
          </button>

          <button
            id="tab-biometrics-btn"
            onClick={() => setActiveTab("biometrics")}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "biometrics"
                ? "bg-vibrant-lime text-black shadow-sm font-black italic"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Biological Stats Configuration</span>
          </button>
        </div>

        {/* Dynamic content rendering with custom margins and spacings */}
        <div className="space-y-8">
          {activeTab === "tracker" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Macros circles overview */}
              <MacroDashboard
                macroGoals={macroGoals}
                loggedFoods={loggedFoods}
                activeCaloriesBurned={activeCaloriesBurned}
                totalStepsToday={totalStepsToday}
                bodyProfile={bodyProfile}
              />
              {/* Hourly Food logs timeline */}
              <DailyLog
                loggedFoods={loggedFoods}
                onRemoveFood={handleRemoveFood}
              />
            </div>
          )}

          {activeTab === "scanner" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
              {/* Food Camera snapshot Scanner */}
              <FoodScanner onAddFood={handleAddFood} />
              
              {/* Natural conversational item parser */}
              <DietAdder onAddFood={handleAddFood} />
            </div>
          )}

          {activeTab === "recipes" && (
            <div className="animate-fadeIn">
              <RecipeDiscovery onAddFood={handleAddFood} />
            </div>
          )}

          {activeTab === "wearables" && (
            <div className="animate-fadeIn">
              <WearableHub
                onSyncWorkout={handleSyncWorkout}
                connectedDevices={connectedDevices}
                onToggleDevice={handleToggleDevice}
              />
            </div>
          )}

          {activeTab === "biometrics" && (
            <div className="animate-fadeIn">
              <BodyCompForm
                initialProfile={bodyProfile}
                onProfileChange={handleProfileChange}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating alert indicator toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 p-4 bg-vibrant-card border border-vibrant-lime text-white rounded-2xl shadow-xl flex items-center gap-2 animate-fadeIn z-50 text-xs font-semibold leading-none">
          <Check className="w-4 h-4 text-vibrant-lime shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Grounded and clean footer layout */}
      <footer className="bg-vibrant-card border-t border-vibrant-border py-8 mt-12 text-center text-xs text-zinc-500 font-bold font-mono">
        <div>CORE_SYNC Habit Tracker © 2026 · Built with Vibrant Kinetic Palette</div>
      </footer>
    </div>
  );
}
