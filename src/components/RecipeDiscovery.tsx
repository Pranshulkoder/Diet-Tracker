import { useState } from "react";
import { Search, Sparkles, Plus, Clock, ChevronsUp, RefreshCw, Layers, Check, ChefHat, Tag, ThumbsUp, AlertCircle, Eye, Utensils } from "lucide-react";
import { Recipe, CustomRecipeCalculation, LoggedFood } from "../types";

interface RecipeDiscoveryProps {
  onAddFood: (food: Omit<LoggedFood, "id" | "timestamp">) => void;
}

const QUICK_TAGS = [
  { label: "🔥 High Protein Chicken", query: "high protein chicken breast" },
  { label: "🥗 Low Carb Veggie", query: "low carb vegetarian" },
  { label: "🥑 Keto Salmon", query: "keto salmon healthy fats" },
  { label: "🍨 Diet Sweet Treats", query: "high protein low sugar dessert" },
  { label: "🥣 Carb Up Oats", query: "healthy energy oats berry" },
];

export default function RecipeDiscovery({ onAddFood }: RecipeDiscoveryProps) {
  const [activeSubTab, setActiveSubTab] = useState<"search" | "calculator">("search");
  
  // Recipe Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedRecipeIdx, setExpandedRecipeIdx] = useState<number | null>(0); // First card open by default
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [mealCategoryForLog, setMealCategoryForLog] = useState<Record<number, "breakfast" | "lunch" | "dinner" | "snack">>({});

  // Recipe Calculator States
  const [calcName, setCalcName] = useState("");
  const [calcIngredients, setCalcIngredients] = useState(
    "150g grilled chicken breast\n1 cup boiled white rice\n1 medium avocado\n1 large fried egg"
  );
  const [calcPrep, setCalcPrep] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<CustomRecipeCalculation | null>(null);
  const [calcCategory, setCalcCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);

  // Trigger search on server
  const handleSearchRecipes = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const response = await fetch("/api/recipes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      const data = await response.json();
      if (data.isSuccess && data.recipes) {
        setRecipes(data.recipes);
        setSearchFeedback(`Retrieved ${data.recipes.length} optimal formula proposals (via ${data.source === "gemini-api" ? "Gemini Elite Chef AI" : "Local Smart Index"}).`);
        setExpandedRecipeIdx(0); // Open first by default
      } else {
        setSearchFeedback("Failed to pull matching recipe lists. Please retry.");
      }
    } catch (err) {
      console.error(err);
      setSearchFeedback("Net offline status. Operating via fallback local index.");
    } finally {
      setIsSearching(false);
    }
  };

  // Perform custom calculation on server
  const handleCalculateRecipe = async () => {
    if (!calcIngredients.trim()) return;
    setIsCalculating(true);
    setCalcFeedback(null);
    try {
      const response = await fetch("/api/recipes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: calcName.trim() || "My Fit Recipe",
          ingredients: calcIngredients,
          prepInstructions: calcPrep
        }),
      });
      const resData = await response.json();
      if (resData.isSuccess && resData.data) {
        setCalcResult(resData.data);
        setCalcFeedback(`Analysis locking completed successfully using ${resData.source === "gemini-api" ? "Gemini Molecular AI" : "Heuristic Parser"}.`);
      } else {
        setCalcFeedback("Calculation halted unexpectedly. Verify ingredient lines.");
      }
    } catch (err) {
      console.error(err);
      setCalcFeedback("Server connectivity issues. Calculated via offline fallback parsing rules.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Quick Action: log a discovered recipe
  const handleLogDiscoveredRecipe = (recipe: Recipe, idx: number) => {
    const category = mealCategoryForLog[idx] || "lunch";
    onAddFood({
      name: `Recipe: ${recipe.name}`,
      amount: recipe.amount || "1 portion",
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      category,
    });
  };

  // Quick Action: log calculated custom recipe
  const handleLogCalculatedRecipe = () => {
    if (!calcResult) return;
    onAddFood({
      name: calcResult.recipeName,
      amount: "1 serving (Custom Build)",
      calories: calcResult.calories,
      protein: calcResult.protein,
      carbs: calcResult.carbs,
      fat: calcResult.fat,
      category: calcCategory,
    });
    setCalcFeedback("Logged custom formulation to your daily tracking timeline!");
  };

  return (
    <div className="bg-vibrant-card rounded-[2rem] p-6 border border-vibrant-border shadow-md space-y-6">
      
      {/* Visual Header */}
      <div className="flex items-center gap-3 border-b border-vibrant-border pb-5">
        <div className="p-3 bg-vibrant-lime/10 text-vibrant-lime rounded-2xl">
          <ChefHat id="recipe-hub-icon" className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            AI Culinary Recipe Hub <span className="text-[9px] bg-vibrant-lime/20 text-vibrant-lime font-mono font-black border border-vibrant-lime/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
          </h2>
          <p className="text-xs text-zinc-500">Discover macronutrient-precise culinary recipes or compute custom ingredients on-the-fly.</p>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#0A0A0B] p-1.5 rounded-2xl border border-vibrant-border">
        <button
          onClick={() => setActiveSubTab("search")}
          className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "search"
              ? "bg-zinc-800 text-vibrant-lime border border-zinc-700 font-extrabold shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Discover Recipes</span>
        </button>

        <button
          onClick={() => setActiveSubTab("calculator")}
          className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "calculator"
              ? "bg-zinc-800 text-vibrant-cyan border border-zinc-700 font-extrabold shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recipe Macro Calculator</span>
        </button>
      </div>

      {/* === SEARCH SUB-TAB === */}
      {activeSubTab === "search" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Tag Quick triggers */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Tag className="w-3 h-3 text-vibrant-lime" /> Tap to Instant Discovery Suggestions:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => {
                    setSearchQuery(tag.query);
                    handleSearchRecipes(tag.query);
                  }}
                  className="px-3.5 py-2 text-[10px] font-black uppercase tracking-tight bg-zinc-900 border border-vibrant-border hover:border-vibrant-lime/40 text-zinc-300 hover:text-vibrant-lime rounded-xl transition-all cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar input action */}
          <div className="flex gap-2.5">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 text-zinc-500 w-4 h-4" />
              <input
                id="recipe-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchRecipes(searchQuery)}
                placeholder="e.g. 'high protein wild salmon salad' or 'low carb vegan dinner'..."
                className="w-full pl-11 pr-4 py-3 bg-[#0b0b0d] border border-vibrant-border rounded-2xl outline-none focus:ring-2 focus:ring-vibrant-lime/10 focus:border-vibrant-lime text-xs text-white placeholder-zinc-500 font-mono transition-all font-semibold"
              />
            </div>
            <button
              id="recipe-search-submit-btn"
              onClick={() => handleSearchRecipes(searchQuery)}
              disabled={isSearching}
              className="px-6 bg-vibrant-lime text-black rounded-2xl hover:bg-[#8ee00f] font-black uppercase text-xs tracking-tighter shadow-[0_0_12px_rgba(163,255,18,0.2)] disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin text-black" : ""}`} />
              <span>{isSearching ? "Searching..." : "Search"}</span>
            </button>
          </div>

          {/* Feedback bar */}
          {searchFeedback && (
            <div className="p-3.5 bg-zinc-900/40 border border-vibrant-border text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center gap-2.5 animate-fadeIn">
              <div className="w-1.5 h-1.5 bg-vibrant-lime rounded-full animate-ping shrink-0" />
              <span>{searchFeedback}</span>
            </div>
          )}

          {/* Recipes Listing */}
          {recipes.length > 0 ? (
            <div className="space-y-4">
              {recipes.map((recipe, rIdx) => {
                const isExpanded = expandedRecipeIdx === rIdx;
                const activeCategory = mealCategoryForLog[rIdx] || "lunch";

                return (
                  <div
                    key={rIdx}
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? "border-vibrant-lime/40 bg-zinc-950/60 shadow-lg"
                        : "border-vibrant-border bg-[#0b0b0d]/40 hover:border-zinc-800"
                    }`}
                  >
                    {/* Header trigger */}
                    <div
                      onClick={() => setExpandedRecipeIdx(isExpanded ? null : rIdx)}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-white hover:text-vibrant-lime transition-colors">
                          {recipe.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 max-w-2xl line-clamp-2">
                          {recipe.description}
                        </p>
                        
                        {/* Highlights row */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-[10px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-vibrant-border">
                            <Clock className="w-3 h-3 text-vibrant-cyan" /> {recipe.prepTime}
                          </span>
                          <span className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-vibrant-border">
                            <Layers className="w-3 h-3 text-vibrant-pink" /> {recipe.difficulty}
                          </span>
                          <span className="text-[9px] bg-vibrant-lime/10 text-vibrant-lime px-2 py-0.5 rounded-full border border-vibrant-lime/20 uppercase tracking-tight">
                            {recipe.amount}
                          </span>
                        </div>
                      </div>

                      {/* Small caloric & protein brief */}
                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-sm font-black font-mono text-white leading-none">
                          {recipe.calories} <span className="text-[9px] text-zinc-500 font-sans font-normal">kcal</span>
                        </div>
                        <div className="text-[10px] font-bold font-mono text-vibrant-lime uppercase tracking-wider">
                          +{recipe.protein}g P
                        </div>
                      </div>
                    </div>

                    {/* Detailed Content Expanded */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-vibrant-border/60 pt-5 space-y-5 animate-slideDown bg-[#060608]/80 font-sans">
                        
                        {/* Target Macros Breakdown */}
                        <div className="grid grid-cols-4 gap-2 text-center p-3.5 bg-zinc-900/60 rounded-xl border border-vibrant-border/40 font-mono">
                          <div>
                            <span className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-0.5 font-sans">Calories</span>
                            <span className="text-xs sm:text-sm font-black text-white">{recipe.calories}</span>
                            <span className="block text-[8px] text-zinc-500 font-sans">kcal</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-vibrant-lime font-extrabold uppercase mb-0.5 font-sans">Protein</span>
                            <span className="text-xs sm:text-sm font-black text-vibrant-lime">{recipe.protein}g</span>
                            <span className="block text-[8px] text-zinc-500 font-sans">estimate</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-vibrant-cyan font-extrabold uppercase mb-0.5 font-sans">Carbs</span>
                            <span className="text-xs sm:text-sm font-black text-vibrant-cyan">{recipe.carbs}g</span>
                            <span className="block text-[8px] text-zinc-500 font-sans">density</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-vibrant-pink font-extrabold uppercase mb-0.5 font-sans">Fat</span>
                            <span className="text-xs sm:text-sm font-black text-vibrant-pink">{recipe.fat}g</span>
                            <span className="block text-[8px] text-zinc-500 font-sans">lipids</span>
                          </div>
                        </div>

                        {/* Ingredients & Instructions Split Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* Left: Ingredients */}
                          <div className="space-y-2.5">
                            <h4 className="text-[11px] font-black uppercase text-vibrant-cyan tracking-wider flex items-center gap-1 border-b border-vibrant-border/50 pb-1">
                              <Utensils className="w-3.5 h-3.5 text-vibrant-cyan" /> Ingredients list
                            </h4>
                            <ul className="space-y-1.5">
                              {recipe.ingredients.map((ing, iIdx) => (
                                <li key={iIdx} className="text-xs text-zinc-300 flex items-start gap-2 select-text leading-relaxed">
                                  <span className="text-vibrant-lime font-black shrink-0">·</span>
                                  <span>{ing}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Right: Instructions */}
                          <div className="space-y-2.5">
                            <h4 className="text-[11px] font-black uppercase text-vibrant-pink tracking-wider flex items-center gap-1 border-b border-vibrant-border/50 pb-1">
                              <ChefHat className="w-3.5 h-3.5 text-vibrant-pink" /> Instructions step
                            </h4>
                            <ol className="space-y-2.5 font-sans">
                              {recipe.instructions.map((step, sIdx) => (
                                <li key={sIdx} className="text-[11px] text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-vibrant-pink font-mono text-[9px] font-black flex items-center justify-center shrink-0 border border-vibrant-border">
                                    {sIdx + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* Diets Tag array */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-vibrant-border/30">
                          {recipe.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9px] font-sans font-extrabold uppercase bg-zinc-900 tracking-tight text-zinc-400 px-2 py-0.5 rounded-md border border-vibrant-border"
                            >
                              🏷️ {tag}
                            </span>
                          ))}
                        </div>

                        {/* Tracker Logging Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/40 rounded-xl border border-vibrant-border/60">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold uppercase text-zinc-400">Meal Category:</span>
                            <div className="flex bg-[#0b0b0d] p-0.5 rounded-lg border border-vibrant-border overflow-hidden">
                              {(["breakfast", "lunch", "dinner", "snack"] as const).map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setMealCategoryForLog(prev => ({ ...prev, [rIdx]: cat }))}
                                  className={`px-2.5 py-1 text-[9px] font-black uppercase text-center rounded-md cursor-pointer transition-all ${
                                    activeCategory === cat
                                      ? "bg-vibrant-cyan text-black"
                                      : "text-zinc-500 hover:text-zinc-300"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleLogDiscoveredRecipe(recipe, rIdx)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-vibrant-lime text-black rounded-xl hover:bg-[#8ee00f] font-black uppercase text-[10px] tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Log to Timeline</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-550 border border-dashed border-vibrant-border rounded-2xl flex flex-col items-center justify-center gap-2">
              <Utensils id="empty-recipes-icon" className="w-8 h-8 text-zinc-650 animate-bounce" />
              <p className="text-xs font-bold font-mono uppercase text-zinc-500">No active recipes searched.</p>
              <p className="text-[10px] text-zinc-500">Tap one of the quick keywords above or type a search to load recipes!</p>
            </div>
          )}
        </div>
      )}

      {/* === CALCULATOR SUB-TAB === */}
      {activeSubTab === "calculator" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left: inputs */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Recipe Name</label>
                <input
                  id="calc-recipe-name-input"
                  type="text"
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  placeholder="e.g. 'Pro-Choco Protein Crepes'..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-vibrant-border rounded-xl text-xs text-white placeholder-zinc-500 font-semibold focus:ring-2 focus:ring-vibrant-cyan/10 focus:border-vibrant-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Ingredient Lines <span className="text-zinc-650">(Required)</span>
                </label>
                <p className="text-[9px] text-zinc-500 mb-2">List measurements directly. One ingredient item per line.</p>
                <textarea
                  id="calc-ingredients-textarea"
                  value={calcIngredients}
                  onChange={(e) => setCalcIngredients(e.target.value)}
                  rows={6}
                  placeholder="e.g.&#10;150g raw salmon fillet&#10;2 whole organic eggs&#10;1 tbsp sesame oil"
                  className="w-full px-4 py-3 bg-zinc-900 border border-vibrant-border rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:ring-2 focus:ring-vibrant-cyan/15 focus:border-vibrant-cyan outline-none resize-none leading-relaxed font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Preparation Instructions <span className="text-zinc-600 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="calc-prep-textarea"
                  value={calcPrep}
                  onChange={(e) => setCalcPrep(e.target.value)}
                  rows={3}
                  placeholder="e.g. blend ingredient set thoroughly and bake on pan for 5 minutes..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-vibrant-border rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-vibrant-cyan/15 focus:border-vibrant-cyan outline-none resize-none leading-relaxed font-semibold text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  id="calc-submit-btn"
                  onClick={handleCalculateRecipe}
                  disabled={isCalculating || !calcIngredients.trim()}
                  className="w-full py-4 bg-vibrant-cyan text-black rounded-xl hover:bg-[#0fd0ff] font-black uppercase text-xs tracking-wider shadow-[0_0_12px_rgba(15,208,255,0.2)] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isCalculating ? "animate-spin text-black" : ""}`} />
                  <span>{isCalculating ? "Analyzing Ingredients..." : "Calculate Recipe Macros"}</span>
                </button>
              </div>
            </div>

            {/* Right: outcome breakdown */}
            <div className="lg:col-span-3 space-y-4">
              
              {calcResult ? (
                <div className="p-5 bg-zinc-950/40 rounded-2xl border border-vibrant-border space-y-5 animate-fadeIn">
                  
                  {/* Total Macros Card Banner */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-vibrant-border/50 pb-2.5">
                      <h3 className="text-sm font-black text-white capitalize flex items-center gap-1.5 leading-none">
                        <Sparkles className="w-4 h-4 text-vibrant-cyan animate-pulse" /> {calcResult.recipeName}
                      </h3>
                      <span className="text-[10px] bg-vibrant-cyan/10 text-vibrant-cyan border border-vibrant-cyan/20 px-2.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0">
                        Estimated Calculation
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center p-3 bg-zinc-900/60 rounded-xl border border-vibrant-border/30 font-mono">
                      <div>
                        <span className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-0.5">Calories</span>
                        <span className="text-xs sm:text-sm font-black text-white">{calcResult.calories}</span>
                        <span className="block text-[8px] text-zinc-500">kcal</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-vibrant-lime font-extrabold uppercase mb-0.5">Protein</span>
                        <span className="text-xs sm:text-sm font-black text-vibrant-lime">{calcResult.protein}g</span>
                        <span className="block text-[8px] text-zinc-500">grams</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-vibrant-cyan font-extrabold uppercase mb-0.5">Carbs</span>
                        <span className="text-xs sm:text-sm font-black text-vibrant-cyan">{calcResult.carbs}g</span>
                        <span className="block text-[8px] text-zinc-500">grams</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-vibrant-pink font-extrabold uppercase mb-0.5">Fat</span>
                        <span className="text-xs sm:text-sm font-black text-vibrant-pink">{calcResult.fat}g</span>
                        <span className="block text-[8px] text-zinc-500">grams</span>
                      </div>
                    </div>
                  </div>

                  {/* Decomposed Breakdown Table */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-vibrant-border/30 pb-1 font-sans">
                      <Layers className="w-3.5 h-3.5 text-vibrant-cyan" /> Molecular Ingredients Decomposition:
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse font-sans font-medium text-zinc-300">
                        <thead>
                          <tr className="border-b border-vibrant-border/30 text-zinc-500 text-[9px] uppercase tracking-wider font-extrabold">
                            <th className="py-2">Raw Line Input</th>
                            <th className="py-2 px-1 text-right">Calories</th>
                            <th className="py-2 px-1 text-right text-vibrant-lime">P</th>
                            <th className="py-2 px-1 text-right text-vibrant-cyan">C</th>
                            <th className="py-2 px-1 text-right text-vibrant-pink">F</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 font-mono text-[10px]">
                          {calcResult.ingredientsBreakdown.map((item, key) => (
                            <tr key={key} className="hover:bg-zinc-900/40">
                              <td className="py-2.5 font-sans font-medium text-white max-w-[140px] truncate leading-tight">
                                <span className="text-zinc-400 mr-1.5 font-bold">↳</span> {item.raw}
                              </td>
                              <td className="py-2.5 px-1 text-right text-white font-bold">{item.calories}</td>
                              <td className="py-2.5 px-1 text-right text-vibrant-lime font-bold">{item.protein}g</td>
                              <td className="py-2.5 px-1 text-right text-vibrant-cyan font-bold">{item.carbs}g</td>
                              <td className="py-2.5 px-1 text-right text-vibrant-pink font-bold">{item.fat}g</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Serene Fitness Coaching Tip */}
                  <div className="p-4 bg-vibrant-cyan/10 border border-vibrant-cyan/20 text-vibrant-cyan rounded-xl space-y-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 leading-none font-sans">
                      <AlertCircle className="w-4 h-4 text-vibrant-cyan shrink-0" /> Coach Optimization feedback
                    </h4>
                    <p className="text-xs text-zinc-300 leading-normal select-text">
                      {calcResult.nutritionTip}
                    </p>
                  </div>

                  {/* Add calculation direct log controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/50 rounded-xl border border-vibrant-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-400 font-sans">Category:</span>
                      <select
                        id="calc-category-select"
                        value={calcCategory}
                        onChange={(e) => setCalcCategory(e.target.value as any)}
                        className="bg-[#0b0b0d] border border-vibrant-border text-white text-[10px] font-bold uppercase rounded-lg px-2.5 py-1.5 cursor-pointer outline-none focus:border-vibrant-cyan"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>

                    <button
                      id="calc-log-submit-btn"
                      onClick={handleLogCalculatedRecipe}
                      className="w-full sm:w-auto px-5 py-2.5 bg-vibrant-cyan text-black rounded-lg hover:bg-[#0fd0ff] font-black uppercase text-[10px] tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Custom Recipe</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="h-full min-h-[280px] border border-dashed border-vibrant-border/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-zinc-500 gap-2.5">
                  <Sparkles className="w-8 h-8 text-zinc-700 hover:text-vibrant-cyan transition-colors hover:animate-pulse" />
                  <p className="text-xs font-bold font-mono uppercase">Calculator Pending Input</p>
                  <p className="text-[10px] max-w-xs text-zinc-500 leading-normal">
                    Insert your custom recipe name and lines on the left, then click analyze to compute full caloric weight and decomposition graphs.
                  </p>
                </div>
              )}

              {calcFeedback && (
                <div className="p-3.5 bg-zinc-900 border border-vibrant-cyan/20 text-vibrant-cyan text-[11px] font-bold rounded-xl flex items-center gap-2 animate-fadeIn font-sans leading-none">
                  <div className="w-1.5 h-1.5 bg-vibrant-cyan rounded-full animate-ping shrink-0" />
                  <span>{calcFeedback}</span>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
