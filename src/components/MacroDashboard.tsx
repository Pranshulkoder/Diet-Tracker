import { useState, useEffect } from "react";
import { Flame, Trophy, Sparkles, RefreshCw, Zap, TrendingUp, HelpCircle } from "lucide-react";
import { MacroGoals, LoggedFood, BodyComposition } from "../types";

interface MacroDashboardProps {
  macroGoals: MacroGoals;
  loggedFoods: LoggedFood[];
  activeCaloriesBurned: number;
  totalStepsToday: number;
  bodyProfile: BodyComposition;
}

export default function MacroDashboard({ macroGoals, loggedFoods, activeCaloriesBurned, totalStepsToday, bodyProfile }: MacroDashboardProps) {
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Math totals for the logged items
  const totals = loggedFoods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.protein += food.protein;
      acc.carbs += food.carbs;
      acc.fat += food.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const roundedTotals = {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  };

  // Remaining calories calculation: Target + Active Burned - Consumed
  const remainingCalories = Math.max(0, (macroGoals.calories + activeCaloriesBurned) - roundedTotals.calories);

  // Percent progress
  const percentCals = Math.min(100, Math.round((roundedTotals.calories / (macroGoals.calories + activeCaloriesBurned)) * 100)) || 0;
  const percentPro = Math.min(100, Math.round((roundedTotals.protein / macroGoals.protein) * 100)) || 0;
  const percentCar = Math.min(100, Math.round((roundedTotals.carbs / macroGoals.carbs) * 100)) || 0;
  const percentFat = Math.min(100, Math.round((roundedTotals.fat / macroGoals.fat) * 100)) || 0;
  const percentSteps = Math.min(100, Math.round((totalStepsToday / 10000) * 100)) || 0;

  // Query server-side Gemini AI daily advisor
  const handleQueryAICoach = async () => {
    setIsReviewing(true);
    setAiReview(null);
    try {
      const response = await fetch("/api/diet/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loggedItems: loggedFoods.map(f => ({ name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat })),
          bodyComp: {
            weight: bodyProfile.weight,
            weightUnit: bodyProfile.weightUnit,
            goal: bodyProfile.goal === "fat-loss" ? "Fat Loss" : bodyProfile.goal === "muscle-gain" ? "Muscle Gain" : bodyProfile.goal === "recomposition" ? "Recomposition" : "Maintenance",
          },
          dailyTarget: macroGoals,
          caloriesBurned: activeCaloriesBurned
        })
      });

      if (!response.ok) {
        throw new Error("Coaching request failed");
      }

      const resData = await response.json();
      if (resData.isSuccess && resData.suggestion) {
        setAiReview(resData.suggestion);
      } else {
        throw new Error("No suggestion compiled from coach.");
      }
    } catch (err) {
      console.error(err);
      setAiReview("AI Review (Simulated fallback):\nPerfect protein pacing! Because your training burnt some energy, ensure high hydration pacing as you continue rest blocks.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Run initial AI coach report pull when daily dataset first loads
  useEffect(() => {
    handleQueryAICoach();
  }, [loggedFoods.length, activeCaloriesBurned]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calorie Progress Wheel Box */}
        <div className="bg-vibrant-card rounded-4xl p-6 border border-vibrant-border shadow-md flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-4">Thermodynamic Calorie Balance</span>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="78"
                className="stroke-zinc-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="88"
                cy="88"
                r="78"
                className="stroke-vibrant-lime transition-all duration-500 ease-out"
                strokeWidth="10"
                strokeDasharray={490}
                strokeDashoffset={490 - (490 * percentCals) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* In-ring details */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-mono font-black text-white leading-none">
                {remainingCalories}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 leading-none">kcal left</span>
              <span className="text-[9px] text-vibrant-lime font-black mt-2 px-2.5 py-1 bg-vibrant-lime/10 rounded-full uppercase tracking-wider">
                {percentCals}% Consumed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full mt-6 text-center">
            <div className="bg-zinc-900/50 p-2 rounded-xl border border-vibrant-border">
              <span className="block text-[8px] text-zinc-500 font-black uppercase">Basic Goal</span>
              <span className="text-xs font-bold font-mono text-white">{macroGoals.calories}</span>
            </div>
            <div className="bg-vibrant-cyan/5 p-2 rounded-xl border border-vibrant-cyan/20">
              <span className="block text-[8px] text-vibrant-cyan font-black uppercase">Burned (Act)</span>
              <span className="text-xs font-bold font-mono text-vibrant-cyan">+{activeCaloriesBurned}</span>
            </div>
            <div className="bg-vibrant-lime/5 p-2 rounded-xl border border-vibrant-lime/20">
              <span className="block text-[8px] text-vibrant-lime font-black uppercase">Consumed</span>
              <span className="text-xs font-bold font-mono text-vibrant-lime">{roundedTotals.calories}</span>
            </div>
          </div>
        </div>

        {/* Macros split bar trackers */}
        <div className="bg-vibrant-card rounded-4xl p-6 border border-vibrant-border shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-5 leading-none">Macro Nutrient Allocations</span>
            
            <div className="space-y-4">
              {/* Protein Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-vibrant-lime shrink-0" /> Protein <span className="text-[10px] text-zinc-500 uppercase">(Growth)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-white">
                    <span className="text-vibrant-lime">{roundedTotals.protein}g</span> <span className="text-zinc-500 font-normal">/ {macroGoals.protein}g</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-850 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-vibrant-lime rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(163,255,18,0.3)]" style={{ width: `${percentPro}%` }} />
                </div>
              </div>

              {/* Carbohydrates Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-vibrant-cyan shrink-0" /> Carbs <span className="text-[10px] text-zinc-500 uppercase">(Glycogen)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-white">
                    <span className="text-vibrant-cyan">{roundedTotals.carbs}g</span> <span className="text-zinc-500 font-normal">/ {macroGoals.carbs}g</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-850 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-vibrant-cyan rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]" style={{ width: `${percentCar}%` }} />
                </div>
              </div>

              {/* Fats Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-vibrant-magenta shrink-0" /> Fats <span className="text-[10px] text-zinc-500 uppercase">(Hormonal)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-white">
                    <span className="text-vibrant-magenta">{roundedTotals.fat}g</span> <span className="text-zinc-500 font-normal">/ {macroGoals.fat}g</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-850 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-vibrant-magenta rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,0,229,0.3)]" style={{ width: `${percentFat}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-vibrant-border flex items-center justify-between text-xs text-zinc-550 text-zinc-500">
            <span>Overall Macro Balance</span>
            <span className="font-bold text-white">
              P: {Math.round((roundedTotals.protein * 4 / (roundedTotals.calories || 1)) * 100)}% · 
              C: {Math.round((roundedTotals.carbs * 4 / (roundedTotals.calories || 1)) * 100)}% · 
              F: {Math.round((roundedTotals.fat * 9 / (roundedTotals.calories || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Daily Steps Level Box */}
        <div className="bg-vibrant-card rounded-4xl p-6 border border-vibrant-border shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block leading-none">Pedometer & Steps tracking</span>
            
            <div className="flex justify-between items-center bg-zinc-900 p-3.5 rounded-2xl border border-vibrant-border">
              <div>
                <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Accrued Steps</span>
                <span className="text-2xl font-mono font-black text-white leading-none mt-1 inline-block">
                  {totalStepsToday.toLocaleString()}
                </span>
              </div>
              <div className="bg-vibrant-cyan/10 text-vibrant-cyan p-2.5 rounded-xl text-center">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            {/* Progress to 10000 limit */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-zinc-500 font-bold uppercase">
                <span>10,000 steps target</span>
                <span>{percentSteps}% Achieved</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-vibrant-cyan rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]" style={{ width: `${percentSteps}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 leading-relaxed font-semibold bg-zinc-900/50 p-3.5 rounded-2xl border border-vibrant-border/50">
            🏃 Sync from wearable (Garmin/iOS) automatically uploads steps, keeping your insulin resistance optimized.
          </div>
        </div>
      </div>

      {/* AI coach Daily suggestions review */}
      <div className="bg-vibrant-card rounded-4xl p-6 border border-vibrant-border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-vibrant-lime/10 text-vibrant-lime rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-md font-bold text-white">Smart Habit Coach Diet Review</h3>
              <p className="text-xs text-zinc-500">Custom athletic advice based on body composition, workouts, & meal logs.</p>
            </div>
          </div>

          <button
            id="ask-ai-review-btn"
            onClick={handleQueryAICoach}
            disabled={isReviewing}
            className="px-5 py-2.5 bg-vibrant-lime text-black leading-none rounded-full text-xs font-black hover:bg-[#8ee00f] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.2)] active:scale-95 uppercase tracking-tighter"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReviewing ? "animate-spin" : ""}`} />
            <span>Refine AI Advice</span>
          </button>
        </div>

        {isReviewing ? (
          <div className="p-6 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-500 mb-2" />
            <span className="text-xs text-zinc-500 font-medium">Diet Coach compiling nutrient density balances...</span>
          </div>
        ) : aiReview ? (
          <div className="p-4 bg-[#1a1a1e] text-[13px] text-zinc-300 leading-relaxed font-sans border border-vibrant-border border-l-4 border-l-vibrant-lime rounded-2xl whitespace-pre-line shadow-xs italic">
            {aiReview}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 font-medium">Click above to generate professional biomechanical habit reviews.</p>
        )}
      </div>
    </div>
  );
}
