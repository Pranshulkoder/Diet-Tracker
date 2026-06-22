var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_groq_sdk = __toESM(require("groq-sdk"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "15mb" }));
var ai = null;
var API_KEY = process.env.GROQ_API_KEY;
if (API_KEY && API_KEY !== "MY_GROQ_API_KEY") {
  try {
    ai = new import_groq_sdk.default({
      apiKey: API_KEY
    });
    console.log("Groq API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Groq Client:", err);
  }
} else {
  console.log("No valid GROQ_API_KEY found. Operating in local fallback simulation mode.");
}
async function generateContentWithFallback(options) {
  if (!ai) {
    throw new Error("Groq AI client not initialized");
  }
  const primaryModel = options.model || "llama-3.3-70b-versatile";
  const fallbackModels = ["openai/gpt-oss-120b", "llama-3.1-8b-instant"];
  const systemInstruction = options.config?.systemInstruction || "You are a helpful assistant.";
  const userMessage = typeof options.contents === "string" ? options.contents : options.contents.parts?.[0]?.text || JSON.stringify(options.contents);
  const responseFormat = options.config?.responseFormat;
  const temperature = typeof options.config?.temperature === "number" ? options.config.temperature : 0.7;
  const maxTokens = typeof options.config?.maxTokens === "number" ? options.config.maxTokens : 1024;
  try {
    const response = await ai.chat.completions.create({
      model: primaryModel,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage }
      ],
      temperature,
      max_tokens: maxTokens,
      ...responseFormat ? { response_format: responseFormat } : {}
    });
    return {
      text: response.choices[0]?.message?.content || ""
    };
  } catch (err) {
    const errMsg = (err?.message || "").toLowerCase();
    const isPermissionOrAccessError = err?.status === 403 || err?.status === 401 || errMsg.includes("permission_denied") || errMsg.includes("denied access") || errMsg.includes("unauthorized");
    console.warn(`[Groq Fallback] Primary model "${primaryModel}" failed: ${err?.message || err}. Attempting fallback models...`);
    let sawAccessRestriction = isPermissionOrAccessError;
    for (const model of fallbackModels) {
      if (model !== primaryModel) {
        try {
          console.log(`[Groq Fallback] Attempting generation with fallback model: "${model}"...`);
          const response = await ai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userMessage }
            ],
            temperature,
            max_tokens: maxTokens,
            ...responseFormat ? { response_format: responseFormat } : {}
          });
          return {
            text: response.choices[0]?.message?.content || ""
          };
        } catch (fallbackErr) {
          const fallbackErrMsg = (fallbackErr?.message || "").toLowerCase();
          const isFallbackPermissionOrAccessError = fallbackErr?.status === 403 || fallbackErr?.status === 401 || fallbackErrMsg.includes("permission_denied") || fallbackErrMsg.includes("unauthorized");
          sawAccessRestriction = sawAccessRestriction || isFallbackPermissionOrAccessError;
          console.warn(`[Groq Fallback] Model "${model}" failed too:`, fallbackErr?.message || fallbackErr);
        }
      }
    }
    if (sawAccessRestriction) {
      console.warn(`[Groq API Warning] Groq access failed for the requested model set. Disabling Groq Client permanently and utilizing pure high-fidelity local fallbacks.`);
      ai = null;
      throw new Error("GROQ_API_RESTRICTED");
    }
    throw err;
  }
}
var MOCK_BARCODE_DATABASE = {
  "4008400401829": {
    name: "Classic Hazelnut Spread (Nutella)",
    amount: "2 tbsp (37g)",
    calories: 200,
    protein: 2,
    carbs: 22,
    fat: 11,
    suggestion: "High in fats and sugar. Enjoy in moderation, or pair with fiber-rich whole wheat toast or oatmeal to slow blood sugar response."
  },
  "123456789012": {
    name: "Oats & Honey Granola",
    amount: "1/2 cup (55g)",
    calories: 240,
    protein: 5,
    carbs: 38,
    fat: 7,
    suggestion: "Excellent carbohydrate source. Consider pairing with a direct source of clean protein like whey or Greek yogurt to balance macros."
  },
  "098765432109": {
    name: "Grass-Fed Whey Protein Isolate",
    amount: "1 Scoop (30g)",
    calories: 120,
    protein: 25,
    carbs: 2,
    fat: 1,
    suggestion: "Elite fast-digesting protein source for muscle recovery. Perfect post-workout. Try blending with a banana for glycogen replenishment."
  },
  "501154649864": {
    name: "Organic Creamy Peanut Butter",
    amount: "2 tbsp (32g)",
    calories: 190,
    protein: 8,
    carbs: 6,
    fat: 16,
    suggestion: "Rich in healthy monounsaturated fats and essential minerals. Great for sustained satiety, but watch portion size, as it is calorie-dense."
  },
  "000000100200": {
    name: "Premium Icelandic Skyr / Greek Yogurt",
    amount: "1 cup (150g)",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.5,
    suggestion: "Extremely high dietary efficiency and packed with probiotics. Fantastic for gut health and building lean body composition."
  },
  "000000300400": {
    name: "Wild Salmon Fillet (Pan-Seared)",
    amount: "150g",
    calories: 260,
    protein: 32,
    carbs: 0,
    fat: 14,
    suggestion: "Optimal source of anti-inflammatory Omega-3 fatty acids and complete essential amino acids. High priority fitness food."
  }
};
app.post("/api/barcode/lookup", async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }
  if (MOCK_BARCODE_DATABASE[barcode]) {
    const data = MOCK_BARCODE_DATABASE[barcode];
    return res.json({
      isSuccess: true,
      data: {
        items: [{
          name: data.name,
          amount: data.amount,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat
        }],
        suggestion: data.suggestion,
        estimatedUpcCode: barcode
      },
      source: "local-database"
    });
  }
  if (ai) {
    try {
      console.log(`Querying Groq to identify product for barcode: ${barcode}`);
      const prompt = `Identify the food product corresponding to this barcode UPC / EAN: "${barcode}". 
Always provide estimated nutritions (Calories, Protein, Carb, Fat) for a standard serving size of this product.
If you don't know the exact product, identify a typical popular product corresponding to standard barcode series or make an intelligent guess.
Respond with ONLY valid JSON in this exact format:
{"items": [{"name": "product name", "amount": "serving size", "calories": number, "protein": number, "carbs": number, "fat": number}], "suggestion": "healthy tip", "estimatedUpcCode": "${barcode}"}`;
      const response = await generateContentWithFallback({
        model: "llama-3.3-70b-versatile",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite fitness nutritionist and structural data parser. Return food macros matching standard databases. Respond with ONLY valid JSON, no markdown, no code blocks."
        }
      });
      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          isSuccess: true,
          data: parsed,
          source: "groq-api"
        });
      }
    } catch (err) {
      if (err?.message === "GROQ_API_RESTRICTED") {
        console.warn("Groq service is restricted. Standard local barcode backup activated.");
      } else {
        console.warn("Groq barcode lookup failed, using simulated barcode generation:", err?.message || err);
      }
    }
  }
  const generatedProductName = `Product Code [${barcode.slice(-4)}]`;
  return res.json({
    isSuccess: true,
    data: {
      items: [{
        name: `${generatedProductName} (Simulated)`,
        amount: "1 serving (100g)",
        calories: 145,
        protein: 11,
        carbs: 15,
        fat: 4.5
      }],
      suggestion: "Set up your GROQ_API_KEY in the Secrets panel to activate live AI scanning for arbitrary unrecognized barcodes with vision models!",
      estimatedUpcCode: barcode
    },
    source: "simulation-agent"
  });
});
app.post("/api/diet/analyze", async (req, res) => {
  const { text, image, mimeType } = req.body;
  if (!text && !image) {
    return res.status(400).json({ error: "Either natural food description text or an image is required" });
  }
  if (ai) {
    try {
      console.log("Analyzing diet using Groq AI...");
      let contents;
      if (image) {
        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: image
            // base64 payload
          }
        };
        const textPart = {
          text: text ? `Identify the food elements and quantity in this image, along with this manual description if any: "${text}". Provide accurate macronutrient and caloric estimates.` : "This image displays a food item, meal, or barcode. Scan and visually identify all food items in this meal, calculate calories, protein, carbs, and fat, and provide structural recommendations."
        };
        contents = { parts: [imagePart, textPart] };
      } else {
        contents = `Extract macro nutrients, calorie counts, and standard portions for this query: "${text}". Split compound descriptions into separate items if applicable. Give positive nutrition adjustments in the suggestion feedback.`;
      }
      const jsonPrompt = typeof contents === "string" ? contents : `${contents.text || JSON.stringify(contents)}

Respond with ONLY valid JSON: {"items": [{"name": "food name", "amount": "portion", "calories": number, "protein": number, "carbs": number, "fat": number}], "suggestion": "nutrition tip"}`;
      const response = await generateContentWithFallback({
        model: "llama-3.3-70b-versatile",
        contents: jsonPrompt,
        config: {
          systemInstruction: "You are Serene Fitness Nutrition Coach. Analyze natural text logs or food photos, extract calories and macros (P, C, F), and deliver direct, actionable habit recommendations. Respond with ONLY valid JSON, no markdown or code blocks."
        }
      });
      if (response && response.text) {
        console.log("Response successfully generated from Groq.");
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          isSuccess: true,
          data: parsed,
          source: "groq-api"
        });
      }
    } catch (err) {
      if (err?.message === "GROQ_API_RESTRICTED") {
        console.warn("Groq service is restricted. Standard local food backup activated.");
      } else {
        console.warn("Groq meal analysis failed, using local simulation:", err?.message || err);
      }
    }
  }
  console.log("Generating high-fidelity simulation analysis...");
  const query = (text || "").toLowerCase();
  let name = text || "Healthy Fitness Plate";
  let amount = "1 serving";
  let calories = 350;
  let protein = 25;
  let carbs = 30;
  let fat = 10;
  let suggestion = "Configure your GROQ_API_KEY in Settings > Secrets to activate live vision scanning and conversational parsing! Here is a healthy macro estimation fallback.";
  if (image) {
    name = "Visually Identified Meal";
    amount = "Standard Plate (Visual)";
    calories = 420;
    protein = 28;
    carbs = 45;
    fat = 12;
    suggestion = "Visual capture analyzed (Simulation): Found general workout replenishment plate containing high protein source and complex starches. Connect your Groq API Key in AI Studio sidebar details for live visual food analysis.";
  } else if (query.includes("egg") || query.includes("omelet")) {
    name = "Whole Eggs & Whites";
    amount = "3 large eggs";
    calories = 210;
    protein = 18;
    carbs = 1.5;
    fat = 14;
    suggestion = "High bioavailability protein and healthy brain-boosting choline. Pair with a fibrous carb like spinach or apple slices to form a fully rounded meal.";
  } else if (query.includes("chicken") || query.includes("breast")) {
    name = "Grilled Skinless Chicken Breast";
    amount = "150g cooked";
    calories = 247;
    protein = 46;
    carbs = 0;
    fat = 5.2;
    suggestion = "Extremely high dietary protein efficiency. Fantastic for maintaining muscle volume while managing absolute caloric ceilings.";
  } else if (query.includes("oat") || query.includes("porridge")) {
    name = "Steel Cut Rolled Oatmeal";
    amount = "1 bowl (75g dry)";
    calories = 280;
    protein = 10;
    carbs = 51;
    fat = 5;
    suggestion = "High-quality beta-glucan soluble fibers. This delivers phenomenal endurance support and steady blood sugar curves for upcoming hard training sessions. Add berries or flaxseeds.";
  } else if (query.includes("yogurt") || query.includes("greekyogurt")) {
    name = "Fat-Free Greek Yogurt";
    amount = "1 cup (200g)";
    calories = 130;
    protein = 22;
    carbs = 8;
    fat = 0.4;
    suggestion = "Splendid amino acid supply. Ideal as a pre-bed snack since it digests slowly, safeguarding muscle tissue mass during overnight rest.";
  } else if (query.includes("rice")) {
    name = "Steamed Basmati Rice";
    amount = "1 cup cooked (150g)";
    calories = 195;
    protein = 4.3;
    carbs = 42;
    fat = 0.4;
    suggestion = "Rapidly digestible, low-stress glucose builder. Great pre or post training. Add green vegetables (fiber) to reduce index pacing if eaten separately from strenuous windows.";
  } else if (query.includes("shake") || query.includes("protein")) {
    name = "Replenishment Fuel Shake";
    amount = "1 shaker cup";
    calories = 180;
    protein = 26;
    carbs = 10;
    fat = 2.5;
    suggestion = "Quick muscular repair fuel. Perfect fluid absorption rate immediately subsequent to your primary training workouts.";
  }
  return res.json({
    isSuccess: true,
    data: {
      items: [{ name, amount, calories, protein, carbs, fat }],
      suggestion
    },
    source: "simulation-agent"
  });
});
app.post("/api/diet/suggestions", async (req, res) => {
  const { loggedItems, bodyComp, dailyTarget, caloriesBurned } = req.body;
  if (ai) {
    try {
      const prompt = `Review this fitness enthusiast's daily diet profile, body status, and targets:
- Current Body Weight: ${bodyComp?.weight || "75"} kg
- Fitness Target: ${bodyComp?.goal || "Fat Loss"}
- Daily Calories Goal: ${dailyTarget?.calories || "2000"} kcal
- Total Active Calories Burned Today: ${caloriesBurned || "350"} kcal
- Logged Food Items: ${JSON.stringify(loggedItems || [])}

Do not simply repeat the values shown. Instead, interpret what the numbers mean in context and identify meaningful patterns, strengths, gaps, and potential limiting factors.
Evaluate:
Protein intake relative to muscle retention/growth needs.
Carbohydrate intake relative to training performance, recovery, and goal.
Fat intake relative to hormonal health and energy balance.
Calorie intake relative to body composition goals.
Body composition trends (weight, body fat %, lean mass, muscle mass, visceral fat, metabolic indicators, if available).
Overall alignment between current habits and the stated fitness objective.`;
      const jsonPrompt = `${prompt}

Respond with ONLY a JSON object with keys "summary" and "suggestions" where suggestions is an array of 3 bullet points.`;
      const response = await generateContentWithFallback({
        model: "llama-3.3-70b-versatile",
        contents: jsonPrompt,
        config: {
          systemInstruction: "You are Serene Fitness Nutrition Coach. Provide exact, helpful, brief action items for muscle maintenance, insulin control, and active replenishment. Respond with ONLY valid JSON, no markdown or code blocks."
        }
      });
      if (response && response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            isSuccess: true,
            suggestion: typeof parsed.summary === "string" ? parsed.summary : response.text.trim(),
            source: "groq-api"
          });
        } catch {
          return res.json({
            isSuccess: true,
            suggestion: response.text.trim(),
            source: "groq-api"
          });
        }
      }
    } catch (err) {
      if (err?.message === "GROQ_API_RESTRICTED") {
        console.warn("Groq service is restricted. Standard local diet habits backup activated.");
      } else {
        console.warn("Groq daily suggestion failed, using fallback:", err?.message || err);
      }
    }
  }
  let goalSuggestion = "Keep up the consistent habits! Good nutrition is built on repeating structure daily.";
  if (bodyComp?.goal === "Fat Loss") {
    goalSuggestion = "Focus on drinking plenty of water, consuming micronutrient-dense cruciferous vegetables to promote mechanical satiety, and prioritizing lean animal proteins to preserve metabolically active muscle tissue during deficit states.";
  } else if (bodyComp?.goal === "Muscle Gain") {
    goalSuggestion = "Ensure a slight caloric surplus, maintain protein pacing of 2.0g per kg of body weight, and consume high-glycemic carbohydrates in your post-training window to drive glycogen replenishment and stimulate protein synthesis.";
  } else if (bodyComp?.goal === "Recomposition") {
    goalSuggestion = "Eat at maintenance calories on active days and a small deficit on resting days, prioritizing high protein distribution every 3-4 hours to fuel body recomposition.";
  }
  return res.json({
    isSuccess: true,
    suggestion: `Here are suggestions based on your body profile targets and mock statistics:

1. **Prioritize Protein Distribution**: Distribute protein evenly across 4 meals today to maximize muscle protein synthesis.
2. **Support Active Repair**: Since you burned about ${caloriesBurned || 120} calories from active activity, support recovery with slow-digesting proteins, complex minerals and magnesium before bed.
3. **${bodyComp?.goal || "Diet Core Adjustment"} Specific recommendation**: ${goalSuggestion}

Configure your GROQ_API_KEY to activate dynamic contextual coaching generated uniquely from real-time nutritional patterns daily!`,
    source: "simulation-agent"
  });
});
var MOCK_RECIPE_DATABASE = [
  {
    name: "Elite Sriracha-Lime Grilled Chicken Bowl",
    description: "Juicy pan-seared chicken breast dry-rubbed with chipotle spices, glazed with fresh lime juice and sriracha, and served over high-fiber broccoli rice.",
    amount: "1 Bowl",
    calories: 380,
    protein: 48,
    carbs: 12,
    fat: 6.5,
    prepTime: "20 mins",
    difficulty: "Easy",
    ingredients: [
      "180g Boneless Skinless Chicken Breast",
      "2 cups of Riced Broccoli (or cauliflower)",
      "1 tbsp Sriracha chili sauce",
      "1/2 Lime (juiced)",
      "1 tsp Olive Oil",
      "Chipotle seasoning, garlic powder, and pink sea salt to taste"
    ],
    instructions: [
      "Butterfly the chicken breast and season with chipotle rub, salt, and garlic powder.",
      "Heat olive oil in a non-stick skillet on medium-high. Sear chicken for 5-6 mins per side until internal temp is 165\xB0F.",
      "Stir-fry raw broccoli rice in a separate pan for 3 mins until soft.",
      "In a small bowl, mix sriracha and lime juice.",
      "Slice chicken, plate it over riced broccoli, and drizzle with the sriracha-lime glaze."
    ],
    tags: ["High Protein", "Low Carb", "Keto", "Clean Eating"]
  },
  {
    name: "Mediterranean High-Protein Tofu Scramble",
    description: "A delicious, ultra-satisfying plant-based scramble loaded with dietary fiber, micro-nutrients, and lean soy protein.",
    amount: "1 Large Plate",
    calories: 290,
    protein: 26,
    carbs: 14,
    fat: 16,
    prepTime: "15 mins",
    difficulty: "Easy",
    ingredients: [
      "200g Extra Firm Organic Tofu (crumbled)",
      "1/2 cup Fresh Baby Spinach",
      "5 Cherry Tomatoes (halved)",
      "4 Black Olives (sliced)",
      "1/2 tbsp Nutritional Yeast (for cheesy B12 hit)",
      "1/2 tsp Turmeric & Black Pepper"
    ],
    instructions: [
      "Drain Tofu and crumble with hands or fork.",
      "In a medium skillet, pan fry tofu with turmeric, salt, and pepper for 5 minutes.",
      "Add halved cherry tomatoes, sliced olives, and yeast. Saute another 3 minutes.",
      "Toss in raw spinach and fold for 1-2 minutes until wilted. Serve hot."
    ],
    tags: ["Vegetarian", "Vegan", "High Protein", "Low Carb", "Dairy-Free"]
  },
  {
    name: "Slow-Release Avocado-Crusted Salmon Fillet",
    description: "Premium pan-seared wild salmon fillet crusted with fresh avocado paste and organic pumpkin seeds to form high-density healthy fatty acids.",
    amount: "1 Salmon Fillet",
    calories: 420,
    protein: 36,
    carbs: 6,
    fat: 28,
    prepTime: "25 mins",
    difficulty: "Medium",
    ingredients: [
      "150g Wild-Caught Salmon Fillet",
      "1/2 Matured Avocado (mashed)",
      "1 tbsp Raw Pumpkin Seeds",
      "1 tsp Lemon Juice & Fresh Dill",
      "Preheated pan salt and cayenne pepper"
    ],
    instructions: [
      "Pat salmon fillet dry and season with dill, sea salt, pepper, and lemon juice.",
      "Pan-sear salmon skin-side-down in a hot skillet for 4 mins, turn over and cook for 3-4 mins.",
      "Mash mature avocado with lemon juice. Spread carefully on top of cooked salmon.",
      "Press raw pumpkin seeds into the avocado layer and serve with steamed greens."
    ],
    tags: ["Keto", "High Protein", "Low Carb", "Healthy Fats", "Omega-3 Rich"]
  },
  {
    name: "Choc-Peanut Greek Yogurt Mousse Dessert",
    description: "Satisfy sugar cravings with this velvety protein cream, designed to release casein proteins slowly overnight.",
    amount: "1 Dessert Bowl",
    calories: 260,
    protein: 30,
    carbs: 16,
    fat: 8,
    prepTime: "10 mins (plus chilling)",
    difficulty: "Easy",
    ingredients: [
      "200g Fat-Free Greek Yogurt or Skyr",
      "15g Chocolate Whey Protein Powder",
      "1 tbsp Powdered Peanut Butter (PB2)",
      "1/2 tsp Dark Cocoa Powder (unsweetened)",
      "5g Sugar-Free Dark Chocolate Chips"
    ],
    instructions: [
      "In a bowl, combine Greek yogurt, whey protein, PB2, and cocoa powder.",
      "Whip aggressively with a whisk or spoon for 2-3 mins until a fluffy, mousse-like aeration forms.",
      "Chill in refrigerator for at least 15 minutes.",
      "Sprinkle sugar-free chocolate chips on top before folding."
    ],
    tags: ["High Protein", "Low Carb", "Sweet Cravings", "Dessert", "Probiotic"]
  },
  {
    name: "Keto Ground Beef Lettuce Cups",
    description: "Crispy lettuce cups loaded with savory ginger-garlic ground beef. Fast, low carb, and nutrient-saturated.",
    amount: "4 Lettuce Cups",
    calories: 390,
    protein: 34,
    carbs: 8,
    fat: 25,
    prepTime: "15 mins",
    difficulty: "Easy",
    ingredients: [
      "150g Lean Ground Beef (93/7)",
      "4 crisp Butter Lettuce or Romaine leaves",
      "1/4 cup Grated Carrots",
      "1 stalk Green Onion (chopped)",
      "1 tbsp Low-Sodium Soy Sauce or Tamari",
      "1 tsp Sesame oil & minced ginger"
    ],
    instructions: [
      "Saute minced ginger and garlic in sesame oil for 1 min in a medium hot skillet.",
      "Add lean ground beef. Break up and brown thoroughly for 6-8 mins.",
      "Stir in low-sodium soy sauce and chopped green onions, cook for 1 more minute.",
      "Spoon hot beef mixture into washed lettuce leaves. Top with fresh grated carrots."
    ],
    tags: ["Keto", "Low Carb", "High Protein", "Gluten-Free"]
  },
  {
    name: "Zesty Omega-Tuna Power Salad Bowl",
    description: "A fast, elite training fuel consisting of light tuna packed in water, mixed with celery crunch and zesty vinaigrette over baby greens.",
    amount: "1 Large Salad Bowl",
    calories: 310,
    protein: 38,
    carbs: 10,
    fat: 14,
    prepTime: "10 mins",
    difficulty: "Easy",
    ingredients: [
      "1 Can (150g) Chunk Light Tuna in Water (drained)",
      "2 cups Mixed Baby Salad Greens",
      "1/2 Cucumber (sliced)",
      "1 tbsp Extra Virgin Olive Oil",
      "1 tbsp Apple Cider Vinegar & Dijon mustard duo",
      "Pinch of sea salt & black pepper"
    ],
    instructions: [
      "Drain tuna meat fully.",
      "In a beautiful serving bowl, lay fresh mixed salad greens and cucumber slices.",
      "Flake tuna on top.",
      "Whisk olive oil, apple cider vinegar, Dijon mustard, salt, and pepper in a small glass.",
      "Drizzle dressing over the bowl and toss lightly to coat."
    ],
    tags: ["Low Carb", "High Protein", "Gluten-Free", "Heart Healthy"]
  }
];
function parseIngredientsMock(name, ingredientsText, prepInstructions) {
  const lines = ingredientsText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const breakdown = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let calories = 55;
    let protein = 2;
    let carbs = 5;
    let fat = 1;
    let matchedName = "Inferred Ingredient";
    let matchedAmount = "1 unit/serving";
    const numberMatch = line.match(/(\d+\.?\d*)/);
    const multiplier = numberMatch ? parseFloat(numberMatch[1]) : 1;
    if (lowerLine.includes("chicken") || lowerLine.includes("poultry") || lowerLine.includes("breast") || lowerLine.includes("turkey")) {
      matchedName = "Lean Poultry Meat";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "150g";
      const scale = numberMatch && multiplier > 10 ? multiplier / 100 : 1.5;
      calories = Math.round(165 * scale);
      protein = Math.round(31 * scale);
      carbs = 0;
      fat = Math.round(3.6 * scale);
    } else if (lowerLine.includes("rice") || lowerLine.includes("grain") || lowerLine.includes("quinoa")) {
      matchedName = "Steamed Grains";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "1 cup";
      const scale = numberMatch && multiplier > 10 ? multiplier / 100 : 1.5;
      calories = Math.round(130 * scale);
      protein = Math.round(2.7 * scale);
      carbs = Math.round(28 * scale);
      fat = Math.round(0.3 * scale);
    } else if (lowerLine.includes("oil") || lowerLine.includes("butter") || lowerLine.includes("margarine") || lowerLine.includes("ghee")) {
      matchedName = "Fats & Oils cooked";
      matchedAmount = numberMatch ? `${numberMatch[1]} tbsp` : "1 tbsp";
      const scale = multiplier;
      calories = Math.round(110 * scale);
      protein = 0;
      carbs = 0;
      fat = Math.round(12 * scale);
    } else if (lowerLine.includes("egg") || lowerLine.includes("whites")) {
      matchedName = "Egg Source";
      matchedAmount = numberMatch ? `${numberMatch[1]} item(s)` : "2 units";
      const scale = multiplier;
      calories = Math.round(75 * scale);
      protein = Math.round(6.5 * scale);
      carbs = Math.round(0.6 * scale);
      fat = Math.round(5 * scale);
    } else if (lowerLine.includes("oat") || lowerLine.includes("wheat") || lowerLine.includes("bran") || lowerLine.includes("muesli")) {
      matchedName = "Raw Oats & Muesli";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "75g (dry)";
      const scale = numberMatch && multiplier > 10 ? multiplier / 100 : 1;
      calories = Math.round(285 * scale);
      protein = Math.round(10.5 * scale);
      carbs = Math.round(52 * scale);
      fat = Math.round(5 * scale);
    } else if (lowerLine.includes("yogurt") || lowerLine.includes("skyr") || lowerLine.includes("curd") || lowerLine.includes("cottage")) {
      matchedName = "High-Protein Dairy Product";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "200g";
      const scale = numberMatch && multiplier > 10 ? multiplier / 100 : 2;
      calories = Math.round(65 * scale);
      protein = Math.round(11.5 * scale);
      carbs = Math.round(4.2 * scale);
      fat = Math.round(0.2 * scale);
    } else if (lowerLine.includes("protein") || lowerLine.includes("whey") || lowerLine.includes("powder") || lowerLine.includes("supplement")) {
      matchedName = "Clean Protein Powder Isolate";
      matchedAmount = numberMatch ? `${numberMatch[1]} scoop(s)` : "1 scoop (30g)";
      const scale = multiplier;
      calories = Math.round(120 * scale);
      protein = Math.round(25 * scale);
      carbs = Math.round(2 * scale);
      fat = Math.round(1.5 * scale);
    } else if (lowerLine.includes("peanut") || lowerLine.includes("almond") || lowerLine.includes("nut") || lowerLine.includes("seed") || lowerLine.includes("cashew")) {
      matchedName = "Nuts / Seed Nutrients";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "2 tbsp (32g)";
      const scale = numberMatch && multiplier > 10 ? multiplier / 32 : multiplier;
      calories = Math.round(190 * scale);
      protein = Math.round(8 * scale);
      carbs = Math.round(6 * scale);
      fat = Math.round(16 * scale);
    } else if (lowerLine.includes("banana") || lowerLine.includes("apple") || lowerLine.includes("berry") || lowerLine.includes("fruit") || lowerLine.includes("mango")) {
      matchedName = "Fruit Portion Mix";
      matchedAmount = numberMatch ? `${numberMatch[1]} piece(s)` : "1 medium size";
      const scale = multiplier;
      calories = Math.round(90 * scale);
      protein = Math.round(1 * scale);
      carbs = Math.round(23 * scale);
      fat = Math.round(0.2 * scale);
    } else if (lowerLine.includes("salmon") || lowerLine.includes("fish") || lowerLine.includes("tuna") || lowerLine.includes("shrimp") || lowerLine.includes("seafood")) {
      matchedName = "Aquatic Seafood Protein";
      matchedAmount = numberMatch ? `${numberMatch[1]}g` : "150g";
      const scale = numberMatch && multiplier > 10 ? multiplier / 100 : 1.5;
      calories = Math.round(150 * scale);
      protein = Math.round(22 * scale);
      carbs = 0;
      fat = Math.round(6 * scale);
    } else {
      matchedName = line.replace(/[0-9]/g, "").trim() || "Active Food Compound";
      if (matchedName.length > 25) matchedName = matchedName.slice(0, 22) + "...";
      matchedAmount = numberMatch ? `${numberMatch[1]} units` : "1 serving";
      const scale = multiplier;
      calories = Math.round(52 * scale);
      protein = Math.round(2 * scale);
      carbs = Math.round(8 * scale);
      fat = Math.round(1 * scale);
    }
    breakdown.push({
      raw: line,
      name: matchedName,
      amount: matchedAmount,
      calories,
      protein,
      carbs,
      fat
    });
    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;
  }
  return {
    recipeName: name || "Nutritious Custom Creation",
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    ingredientsBreakdown: breakdown,
    nutritionTip: `Calculated successfully. Total Protein efficiency is about ${Math.round(totalProtein * 4 / (totalCalories || 1) * 100)}% of total energy. Expand micronutrient density by integrating leafy greens and support rapid cellular repair post-workout.`
  };
}
app.post("/api/recipes/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Search keyword/query is required" });
  }
  const queryLower = query.toLowerCase();
  if (ai) {
    try {
      console.log(`Searching recipes on Groq with query: "${query}"...`);
      const prompt = `Search and discover recipes matching this query: "${queryLower}". 
Make sure you deliver exactly 3 to 4 distinct high-fidelity fitness recipe proposals. 
Assign real-world macronutrient and calorie balances (such as high-protein meat being protein-saturated, carbs in grains, fats in oils).
Include detailed measurements inside the ingredients array. Deliver structured, clear step-by-step cooking instructions (3-5 steps).`;
      const jsonPrompt = `${prompt}

Respond with ONLY valid JSON with "recipes" key containing an array of recipe objects with: name, description, amount, calories, protein, carbs, fat, prepTime, difficulty, ingredients (array), instructions (array), tags (array).`;
      const response = await generateContentWithFallback({
        model: "llama-3.3-70b-versatile",
        contents: jsonPrompt,
        config: {
          systemInstruction: "You are Serene Fitness Head Chef and Executive Nutritionist. Provide pristine recipe outcomes as valid JSON. Respond with ONLY valid JSON, no markdown or code blocks.",
          responseFormat: { type: "json_object" }
        }
      });
      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          isSuccess: true,
          recipes: parsed.recipes,
          source: "groq-api"
        });
      }
    } catch (err) {
      if (err?.message === "GROQ_API_RESTRICTED") {
        console.warn("Groq service is restricted. Pure local keyword recipe index activated.");
      } else {
        console.warn("Groq recipe search failed, utilizing keyword fallback:", err?.message || err);
      }
    }
  }
  console.log("Recipes search: using offline keyword indexing fallback...");
  let matched = MOCK_RECIPE_DATABASE.filter((r) => {
    const textSearch = (r.name + " " + r.description + " " + r.tags.join(" ")).toLowerCase();
    const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    if (keywords.length === 0) return true;
    return keywords.some((kw) => textSearch.includes(kw));
  });
  if (matched.length === 0) {
    matched = MOCK_RECIPE_DATABASE.slice(0, 3);
  }
  return res.json({
    isSuccess: true,
    recipes: matched,
    source: "simulation-agent"
  });
});
app.post("/api/recipes/calculate", async (req, res) => {
  const { name, ingredients, prepInstructions } = req.body;
  if (!ingredients || ingredients.trim() === "") {
    return res.status(400).json({ error: "Ingredients text list is required to compute nutrition values" });
  }
  if (ai) {
    try {
      console.log(`Calculating nutrition on Groq for custom recipe: "${name}"...`);
      const prompt = `Decompose are parse the individual ingredients listed below and calculate the entire caloric weight and macro counts (Protein, Carbs, Fats) for this custom recipe.
Title specified: "${name || "My Custom Formulation"}"
Ingredients Input:
${ingredients}

Pre-instructions:
${prepInstructions || "None given."}

Respond back with the recipe title, sum summaries of calories, proteins, carbohydrates, fats, and provide a clear detailed list of each ingredient decomposed to display their contribution in the breakdown array. Add high-performance sports nutrition feedback in the nutritionTip feedback.`;
      const jsonPrompt = `${prompt}

Respond with ONLY valid JSON: {"recipeName": "name", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientsBreakdown": [{"raw": "input line", "name": "ingredient", "amount": "portion", "calories": number, "protein": number, "carbs": number, "fat": number}], "nutritionTip": "suggestion"}`;
      const response = await generateContentWithFallback({
        model: "llama-3.3-70b-versatile",
        contents: jsonPrompt,
        config: {
          systemInstruction: "You are Serene Fitness Nutrition Coach and Molecular Food Analyst. Parse custom ingredients text, evaluate caloric value lines, and provide premium dietary optimizations. Respond with ONLY valid JSON, no markdown or code blocks.",
          responseFormat: { type: "json_object" }
        }
      });
      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          isSuccess: true,
          data: parsed,
          source: "groq-api"
        });
      }
    } catch (err) {
      if (err?.message === "GROQ_API_RESTRICTED") {
        console.warn("Groq service is restricted. Intelligent heuristics formula calculator activated.");
      } else {
        console.warn("Groq custom recipe calculation failed, utilizing heuristics parser:", err?.message || err);
      }
    }
  }
  console.log("Custom Recipe: resolving via offline intelligent heuristics parser...");
  const calculationResult = parseIngredientsMock(name, ingredients, prepInstructions);
  return res.json({
    isSuccess: true,
    data: calculationResult,
    source: "simulation-agent"
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Habit Diet Tracker server listening on port ${PORT}`);
  });
}
var server_default = app;
if (process.env.VERCEL !== "1") {
  startServer();
}
//# sourceMappingURL=server.cjs.map
