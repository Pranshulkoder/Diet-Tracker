import { useState } from "react";
import { Sparkles, MessageSquareCode, Plus, Check, RefreshCw, Zap, Lightbulb } from "lucide-react";
import { LoggedFood } from "../types";

interface DietAdderProps {
  onAddFood: (food: Omit<LoggedFood, "id" | "timestamp">) => void;
}

const PRESET_IDEAS = [
  "Cooked salmon fillet 150g with steamed brown rice and mixed green salad",
  "Oatmeal with whey isolate, 10g crushed almonds, and organic strawberries",
  "3 scrambled eggs with spinach, avocado slices, and whole wheat toast",
  "Double double scoop protein shake blended with water and 1 raw banana"
];

export default function DietAdder({ onAddFood }: DietAdderProps) {
  const [naturalText, setNaturalText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [notification, setNotification] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleAnalyzeText = async (customQuery?: string) => {
    const textToQuery = customQuery || naturalText;
    if (!textToQuery.trim()) return;

    setIsProcessing(true);
    setErrorText(null);
    setParsedResult(null);

    try {
      const response = await fetch("/api/diet/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToQuery.trim() })
      });

      if (!response.ok) {
        throw new Error("API analysis request unsuccessful");
      }

      const resData = await response.json();
      if (resData.isSuccess && resData.data) {
        setParsedResult(resData.data);
        if (customQuery) {
          setNaturalText(customQuery);
        }
      } else {
        throw new Error("Received unstructured meal analysis format.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Failed to process meal query. Please check your networks or modify description.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndAdd = () => {
    if (!parsedResult || !parsedResult.items || parsedResult.items.length === 0) return;

    parsedResult.items.forEach((item: any) => {
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

    setNotification(`Successfully logged ${parsedResult.items.length} items to ${selectedCategory}.`);
    setParsedResult(null);
    setNaturalText("");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-vibrant-card rounded-[2rem] p-6 border border-vibrant-border shadow-md space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-vibrant-lime/10 text-vibrant-lime rounded-2xl">
          <Sparkles id="sparkles-logo-badge" className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Conversational Diet Adder</h2>
          <p className="text-xs text-zinc-500">Log intricate homemade recipes by describing what you ate naturally.</p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-vibrant-lime/10 text-vibrant-lime text-xs font-bold rounded-2xl flex items-center gap-2 border border-vibrant-lime/25 animate-fadeIn">
          <Check className="w-4 h-4 text-vibrant-lime shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorText && (
        <div className="p-4 bg-vibrant-pink/10 text-vibrant-pink text-xs font-bold rounded-2xl flex items-center gap-2 border border-vibrant-pink/25 animate-fadeIn">
          <AlertIcon className="w-4 h-4 text-vibrant-pink shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Primary Input Panel */}
      {!parsedResult ? (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              id="diet-adder-textarea"
              rows={3}
              placeholder="e.g. I had two scoops of premium grass-fed whey isolate with 250ml soy milk and a pinch of crushed peanuts"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              className="w-full xl:p-4 p-3 bg-zinc-900 text-white text-xs leading-relaxed font-semibold rounded-2xl outline-none border border-vibrant-border focus:border-vibrant-lime focus:ring-2 focus:ring-vibrant-lime/10 transition-all placeholder-zinc-650"
            />
          </div>

          {/* Quick Suggestions Tags */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 block uppercase tracking-wider leading-none">
              <Lightbulb className="w-3.5 h-3.5 text-vibrant-cyan inline-block mr-1.5" /> Idea Prompt Helpers (Click to try):
            </span>
            <div className="flex flex-col gap-1.5">
              {PRESET_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  id={`preset-idea-${idx}`}
                  type="button"
                  onClick={() => handleAnalyzeText(idea)}
                  className="text-left text-xs text-zinc-350 font-semibold p-2.5 rounded-xl hover:bg-zinc-900 hover:text-vibrant-cyan border border-vibrant-border/60 hover:border-vibrant-cyan/40 bg-zinc-900/50 transition-all font-sans leading-normal cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze/Process Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <MessageSquareCode className="w-4 h-4 text-vibrant-cyan shrink-0" />
              <span>Full semantic itemizer. Uses Gemini to calculate precise nutritional density.</span>
            </div>

            <button
              id="analyze-food-btn"
              onClick={() => handleAnalyzeText()}
              disabled={isProcessing || !naturalText.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-vibrant-lime text-black rounded-full text-xs font-black uppercase tracking-tighter hover:bg-[#8ee00f] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.2)] shrink-0"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Itemizing your meal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Analyze Meal & Macros</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results parsed and ready for confirmation */
        <div className="p-5 border border-vibrant-border bg-[#131417] rounded-3xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-vibrant-lime font-black uppercase tracking-wider leading-none">
              <Sparkles className="w-4 h-4 text-vibrant-lime animate-bounce shrink-0" />
              <span>DIET MATRICES PARSED</span>
            </div>
            <button
              id="reset-adder-btn"
              onClick={() => setParsedResult(null)}
              className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-vibrant-border rounded-lg text-zinc-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2.5">
            {parsedResult.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-zinc-900 p-4 rounded-2xl border border-vibrant-border flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Parsed amount: {item.amount || "1 serving"}</p>
                </div>

                <div className="flex gap-2 text-center select-none">
                  <div className="bg-vibrant-lime/10 px-2 py-1.5 rounded-lg border border-vibrant-lime/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-lime font-bold uppercase">KCAL</span>
                    <span className="text-xs font-black text-white font-mono leading-none mt-0.5 block">{Math.round(item.calories)}</span>
                  </div>
                  <div className="bg-vibrant-lime/5 px-2 py-1.5 rounded-lg border border-vibrant-lime/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-lime font-bold uppercase">PRO</span>
                    <span className="text-xs font-black text-vibrant-lime font-mono leading-none mt-0.5 block">{Math.round(item.protein)}g</span>
                  </div>
                  <div className="bg-vibrant-cyan/10 px-2 py-1.5 rounded-lg border border-vibrant-cyan/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-cyan font-bold uppercase">CARB</span>
                    <span className="text-xs font-black text-vibrant-cyan font-mono leading-none mt-0.5 block">{Math.round(item.carbs)}g</span>
                  </div>
                  <div className="bg-vibrant-magenta/10 px-2 py-1.5 rounded-lg border border-vibrant-magenta/10 min-w-[40px]">
                    <span className="block text-[6px] text-vibrant-magenta font-bold uppercase">FAT</span>
                    <span className="text-xs font-black text-vibrant-magenta font-mono leading-none mt-0.5 block">{Math.round(item.fat)}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Optimizer coaching tip */}
          {parsedResult.suggestion && (
            <div className="p-4 bg-[#1a1a1e] rounded-2xl border border-vibrant-border text-xs text-zinc-350 leading-relaxed flex items-start gap-2.5 border-l-4 border-l-vibrant-lime">
              <Zap className="w-4 h-4 text-vibrant-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-white">Optimization Feedback:</span> {parsedResult.suggestion}
              </div>
            </div>
          )}

          {/* Confirm Block */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-vibrant-border self-start">
              {["breakfast", "lunch", "dinner", "snack"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`conversational-slot-${cat}`}
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
              id="confirm-parsed-food-btn"
              onClick={handleConfirmAndAdd}
              className="px-6 py-3.5 bg-vibrant-lime text-black rounded-full text-xs font-black uppercase tracking-tighter hover:bg-[#8ee00f] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(163,255,18,0.3)] shrink-0"
            >
              <Plus className="w-4 h-4 text-black animate-pulse" />
              <span>Log Items to Tracker</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  );
}
