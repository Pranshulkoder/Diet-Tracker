export type FitnessGoal = "fat-loss" | "muscle-gain" | "recomposition" | "maintenance";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";

export interface BodyComposition {
  weight: number;          // in kg or lbs
  weightUnit: "kg" | "lbs";
  height: number;          // in cm or inches
  heightUnit: "cm" | "in";
  age: number;
  gender: "male" | "female" | "other";
  bodyFat?: number;        // percentage
  muscleMass?: number;      // weight or percentage
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
}

export interface MacroGoals {
  calories: number;        // kcal
  protein: number;         // g
  carbs: number;           // g
  fat: number;             // g
}

export interface LoggedFood {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;       // ISO string
  category: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface Workout {
  id: string;
  type: string;
  duration: number;        // in minutes
  intensity: "low" | "medium" | "high";
  caloriesBurned: number;
  source: string;
  timestamp: string;       // ISO string
  heartRateAvg?: number;
}

export interface WearableDevice {
  id: "apple-health" | "google-fit" | "fitbit" | "garmin";
  name: string;
  brand: string;
  isConnected: boolean;
  lastSynced?: string;
  todaySteps: number;
  caloriesBurnedActive: number;
  averageHr: number;
  syncStatus: "idle" | "syncing" | "error";
}

export interface Recipe {
  name: string;
  description: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

export interface CustomRecipeCalculation {
  recipeName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientsBreakdown: {
    raw: string;
    name: string;
    amount: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  nutritionTip: string;
}

