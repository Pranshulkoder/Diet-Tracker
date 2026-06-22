import React, { useState, useEffect } from "react";
import { Scale, Activity, Calculator, TrendingUp, Sliders, CheckCircle2, Dumbbell } from "lucide-react";
import { BodyComposition, MacroGoals, FitnessGoal, ActivityLevel } from "../types";

interface BodyCompFormProps {
  initialProfile: BodyComposition;
  onProfileChange: (profile: BodyComposition, targets: MacroGoals) => void;
}

export default function BodyCompForm({ initialProfile, onProfileChange }: BodyCompFormProps) {
  const [weight, setWeight] = useState(initialProfile.weight);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(initialProfile.weightUnit);
  const [height, setHeight] = useState(initialProfile.height);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">(initialProfile.heightUnit);
  const [age, setAge] = useState(initialProfile.age);
  const [gender, setGender] = useState<"male" | "female" | "other">(initialProfile.gender);
  const [bodyFat, setBodyFat] = useState<number | "">(initialProfile.bodyFat || "");
  const [muscleMass, setMuscleMass] = useState<number | "">(initialProfile.muscleMass || "");
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile.goal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile.activityLevel);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-calculate targets when parameters change
  const calculateTargets = (): MacroGoals => {
    // Convert to metric internally
    const weightKg = weightUnit === "lbs" ? weight * 0.453592 : weight;
    const heightCm = heightUnit === "in" ? height * 2.54 : height;

    // Mifflin-St Jeor BMR
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === "female") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
    }

    // TDEE Activity Multipliers
    const multipliers: Record<ActivityLevel, number> = {
      "sedentary": 1.2,       // Desk job, minimal active walk
      "light": 1.375,         // Casual steps, 1-2 slow runs
      "moderate": 1.55,       // Lifting/Cardio 3-4 days/week
      "active": 1.725,         // Hard training 5-6 days/week
      "very-active": 1.9,     // Daily intensive training, manual labor
    };

    const tdee = bmr * multipliers[activityLevel];
    let calories = Math.round(tdee);
    let proteinG = 0;
    let fatG = 0;
    let carbsG = 0;

    // High performance fitness enthusiast nutrition profile distribution
    if (goal === "fat-loss") {
      // 20% deficit
      calories = Math.round(tdee * 0.8);
      // High protein to prevent catabolism: 2.3g per kg
      proteinG = Math.round(weightKg * 2.3);
      // ~25% fats
      const fatCalories = calories * 0.25;
      fatG = Math.round(fatCalories / 9);
      // Remainder for complex carbs
      const carbCalories = calories - (proteinG * 4) - (fatG * 9);
      carbsG = Math.max(25, Math.round(carbCalories / 4));
    } else if (goal === "muscle-gain") {
      // 10% surplus
      calories = Math.round(tdee * 1.1);
      // Bulking protein density: 2.0g per kg
      proteinG = Math.round(weightKg * 2.1);
      // ~30% fats for hormone health
      const fatCalories = calories * 0.28;
      fatG = Math.round(fatCalories / 9);
      // Remainder for clean performance glycogen (carbs)
      const carbCalories = calories - (proteinG * 4) - (fatG * 9);
      carbsG = Math.round(carbCalories / 4);
    } else if (goal === "recomposition") {
      // Small 5% deficit, elite balance
      calories = Math.round(tdee * 0.95);
      // Ultra-high protein: 2.4g per kg to support recovery on deficit
      proteinG = Math.round(weightKg * 2.4);
      // Standard fats (~25%)
      const fatCalories = calories * 0.25;
      fatG = Math.round(fatCalories / 9);
      // Moderated carbs
      const carbCalories = calories - (proteinG * 4) - (fatG * 9);
      carbsG = Math.round(carbCalories / 4);
    } else {
      // Maintenance
      calories = Math.round(tdee);
      // 1.8g per kg
      proteinG = Math.round(weightKg * 1.9);
      // 30% fats
      const fatCalories = calories * 0.28;
      fatG = Math.round(fatCalories / 9);
      // Carbs
      const carbCalories = calories - (proteinG * 4) - (fatG * 9);
      carbsG = Math.round(carbCalories / 4);
    }

    return {
      calories: Math.max(1200, calories),
      protein: Math.max(40, proteinG),
      carbs: Math.max(50, carbsG),
      fat: Math.max(30, fatG)
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedProfile: BodyComposition = {
      weight: Number(weight),
      weightUnit,
      height: Number(height),
      heightUnit,
      age: Number(age),
      gender,
      bodyFat: bodyFat !== "" ? Number(bodyFat) : undefined,
      muscleMass: muscleMass !== "" ? Number(muscleMass) : undefined,
      goal,
      activityLevel
    };

    const computedTargets = calculateTargets();
    onProfileChange(computedProfile, computedTargets);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-vibrant-card rounded-4xl p-6 md:p-8 border border-vibrant-border shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-vibrant-cyan/10 text-vibrant-cyan rounded-2xl">
          <Scale id="body-composition-icon" className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Your Body Bio-Metrics</h2>
          <p className="text-xs text-zinc-550 text-zinc-500">Formulates precise thermic, metabolic, and energy expenditure limits.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Current Weight</label>
            <div className="flex gap-2">
              <input
                id="weight-input"
                type="number"
                step="0.1"
                required
                min="30"
                max="500"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan font-semibold font-mono text-xs"
              />
              <select
                id="weight-unit-select"
                value={weightUnit}
                onChange={(e) => {
                  const unit = e.target.value as "kg" | "lbs";
                  setWeightUnit(unit);
                  // Convert weight placeholder representation
                  if (unit === "lbs" && weightUnit === "kg") {
                    setWeight(Math.round(weight * 2.20462 * 10) / 10);
                  } else if (unit === "kg" && weightUnit === "lbs") {
                    setWeight(Math.round(weight / 2.20462 * 10) / 10);
                  }
                }}
                className="px-3.5 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 font-bold text-xs cursor-pointer"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Height</label>
            <div className="flex gap-2">
              <input
                id="height-input"
                type="number"
                step="0.1"
                required
                min="100"
                max="250"
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan font-semibold font-mono text-xs"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
              <select
                id="height-unit-select"
                value={heightUnit}
                onChange={(e) => {
                  const unit = e.target.value as "cm" | "in";
                  setHeightUnit(unit);
                  if (unit === "in" && heightUnit === "cm") {
                    setHeight(Math.round(height / 2.54 * 10) / 10);
                  } else if (unit === "cm" && heightUnit === "in") {
                    setHeight(Math.round(height * 2.54 * 10) / 10);
                  }
                }}
                className="px-3.5 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 font-bold text-xs cursor-pointer"
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Age (years)</label>
              <input
                id="age-input"
                type="number"
                required
                min="10"
                max="120"
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan font-semibold font-mono text-xs"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Sex</label>
              <select
                id="gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 font-medium text-xs cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Body Fat & Muscle Mass (Advanced attributes) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Body Fat % <span className="text-zinc-600 font-normal">(Opt)</span></label>
              <input
                id="body-fat-input"
                type="number"
                min="3"
                max="60"
                placeholder="e.g. 14%"
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan font-semibold font-mono text-xs"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Muscle Mass <span className="text-zinc-600 font-normal">(Opt)</span></label>
              <input
                id="muscle-mass-input"
                type="number"
                min="10"
                max="90"
                placeholder="e.g. 42%"
                className="w-full px-4 py-3 rounded-2xl border border-vibrant-border bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan font-semibold font-mono text-xs"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Goal Profile Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2"><TrendingUp className="inline-block w-4 h-4 mr-1 text-zinc-500" /> Primary Fitness Goal</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: "fat-loss", name: "Fat Loss (Cut)", desc: "-20% deficit, High protein pacing" },
              { id: "muscle-gain", name: "Lean Bulk", desc: "+10% surplus, glycogen builder" },
              { id: "recomposition", name: "Body Recomp", desc: "Build & Burn, maintenance cycling" },
              { id: "maintenance", name: "Maintenance", desc: "Stable metabolic energy" }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                id={`goal-btn-${g.id}`}
                onClick={() => setGoal(g.id as FitnessGoal)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  goal === g.id
                    ? "border-vibrant-cyan bg-vibrant-cyan/10"
                    : "border-vibrant-border bg-zinc-900/50 hover:bg-zinc-900"
                }`}
              >
                <span className={`text-sm font-black ${goal === g.id ? "text-vibrant-cyan" : "text-white"}`}>
                  {g.name}
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight mt-1">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Active Energy Expenditure Level */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2"><Activity className="inline-block w-4 h-4 mr-1 text-zinc-500" /> Lifestyle & Daily Activity Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { id: "sedentary", label: "Sedentary", desc: "Desk bounds" },
              { id: "light", label: "Light", desc: "10k steps/day" },
              { id: "moderate", label: "Moderate", desc: "Lifting 3-4x" },
              { id: "active", label: "Active", desc: "Daily training" },
              { id: "very-active", label: "Athletic", desc: "Manual plus drills" }
            ].map((act) => (
              <button
                key={act.id}
                type="button"
                id={`activity-btn-${act.id}`}
                onClick={() => setActivityLevel(act.id as ActivityLevel)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                  activityLevel === act.id
                    ? "border-vibrant-cyan bg-vibrant-cyan/10"
                    : "border-vibrant-border bg-zinc-900/45 hover:bg-zinc-900"
                }`}
              >
                <span className={`text-xs font-black ${activityLevel === act.id ? "text-vibrant-cyan" : "text-zinc-350"}`}>
                  {act.label}
                </span>
                <span className="text-[9px] text-zinc-500 mt-0.5">{act.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Action buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calculator className="w-4 h-4 text-vibrant-cyan shrink-0" />
            <span>Mifflin-St Jeor metabolic target matrix auto-applied.</span>
          </div>

          <button
            id="save-profile-btn"
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-vibrant-lime text-black rounded-full hover:bg-[#8ee00f] transition-all font-black uppercase text-xs tracking-tighter flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.2)] shrink-0"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black animate-pulse" />
                <span>Computed & Locked!</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-4 h-4 text-black" />
                <span>Recalculate Macro Targets</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
