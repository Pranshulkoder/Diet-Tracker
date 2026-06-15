import { Trash2, Calendar, Coffee, Utensils, Moon, Apple } from "lucide-react";
import { LoggedFood } from "../types";

interface DailyLogProps {
  loggedFoods: LoggedFood[];
  onRemoveFood: (id: string) => void;
}

export default function DailyLog({ loggedFoods, onRemoveFood }: DailyLogProps) {
  // Group foods by category slot
  const categories: Record<LoggedFood["category"], LoggedFood[]> = {
    breakfast: loggedFoods.filter((f) => f.category === "breakfast"),
    lunch: loggedFoods.filter((f) => f.category === "lunch"),
    dinner: loggedFoods.filter((f) => f.category === "dinner"),
    snack: loggedFoods.filter((f) => f.category === "snack"),
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "breakfast":
        return { icon: Coffee, title: "Breakfast Logs", bg: "bg-vibrant-lime/15 text-vibrant-lime border-vibrant-lime/20" };
      case "lunch":
        return { icon: Utensils, title: "Lunch Logs", bg: "bg-vibrant-cyan/15 text-vibrant-cyan border-vibrant-cyan/25" };
      case "dinner":
        return { icon: Moon, title: "Dinner Logs", bg: "bg-vibrant-magenta/15 text-vibrant-magenta border-vibrant-magenta/25" };
      default:
        return { icon: Apple, title: "Snack Logs", bg: "bg-vibrant-pink/15 text-vibrant-pink border-vibrant-pink/25" };
    }
  };

  const calculateCategoryTotals = (foods: LoggedFood[]) => {
    return foods.reduce(
      (acc, curr) => {
        acc.calories += curr.calories;
        acc.protein += curr.protein;
        acc.carbs += curr.carbs;
        acc.fat += curr.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const hasAnyFoods = loggedFoods.length > 0;

  return (
    <div className="bg-vibrant-card rounded-[2rem] p-6 border border-vibrant-border shadow-md space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-vibrant-lime/10 text-vibrant-lime rounded-2xl">
          <Calendar id="calendar-icon-daily" className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Logged Food & Habits Intake Checklist</h2>
          <p className="text-xs text-zinc-500">Hourly logs detailing macro-nutrient breakdowns and caloric allocations.</p>
        </div>
      </div>

      {!hasAnyFoods ? (
        <div className="py-12 border-2 border-dashed border-zinc-850 border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/10">
          <Utensils className="w-8 h-8 text-zinc-650 mb-2" />
          <h3 className="text-sm font-semibold text-white">Your visual meal logs are empty</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm leading-relaxed">
            Record items above using the visual scanner, conversational input, or demo barcode taps to populate your daily nutrition timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((cat) => {
            const list = categories[cat];
            if (list.length === 0) return null;

            const theme = getCategoryTheme(cat);
            const CatIcon = theme.icon;
            const totals = calculateCategoryTotals(list);

            return (
              <div key={cat} id={`cat-section-${cat}`} className="space-y-3">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-vibrant-border">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${theme.bg}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-white capitalize">{theme.title}</h3>
                    <span className="text-[10px] bg-zinc-900 text-zinc-400 font-bold px-2.5 py-0.5 rounded-full">
                      {list.length} {list.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Category Totals */}
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold font-mono tracking-wider">
                    <span className="text-vibrant-lime font-black">{Math.round(totals.calories)} kcal</span>
                    <span className="text-zinc-800">|</span>
                    <span>P: <span className="text-vibrant-lime">{Math.round(totals.protein)}g</span></span>
                    <span className="text-zinc-800">·</span>
                    <span>C: <span className="text-vibrant-cyan">{Math.round(totals.carbs)}g</span></span>
                    <span className="text-zinc-800">·</span>
                    <span>F: <span className="text-vibrant-magenta">{Math.round(totals.fat)}g</span></span>
                  </div>
                </div>

                {/* Individual Cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((food) => (
                    <div
                      key={food.id}
                      id={`food-card-${food.id}`}
                      className="bg-zinc-900/40 border border-vibrant-border rounded-2xl p-4 flex items-center justify-between hover:border-vibrant-lime/30 hover:bg-zinc-900/70 transition-all duration-200 group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white leading-tight">{food.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold">
                          <span>Qty: {food.amount}</span>
                          <span>·</span>
                          <span>{new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-right">
                          <div className="hidden sm:block text-center bg-zinc-900 px-2 py-1 rounded-md border border-vibrant-border">
                            <span className="block text-[6px] text-zinc-500 font-black leading-none uppercase">KCAL</span>
                            <span className="text-[10px] font-black text-white font-mono leading-none">{food.calories}</span>
                          </div>
                          <div className="hidden sm:block text-center bg-zinc-900 px-2 py-1 rounded-md border border-vibrant-border">
                            <span className="block text-[6px] text-zinc-500 font-black leading-none uppercase">PRO</span>
                            <span className="text-[10px] font-black text-vibrant-lime font-mono leading-none">{food.protein}g</span>
                          </div>
                        </div>

                        {/* Summary for small view constraints */}
                        <div className="sm:hidden text-right text-[10px] font-bold text-vibrant-lime font-mono">
                          {food.calories} kcal
                        </div>

                        <button
                          id={`remove-food-btn-${food.id}`}
                          onClick={() => onRemoveFood(food.id)}
                          className="p-2 text-zinc-650 hover:text-vibrant-pink hover:bg-vibrant-pink/10 rounded-xl transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
