import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// High body limit for base64 chart images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini SDK with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Strategy descriptions for prompt guidance
const STRATEGY_PROMPTS: Record<string, string> = {
  "Smart AI": "Select the highest probability institutional setup considering market structure, momentum, and liquidity.",
  "Trend Following": "Focus on continuation in the prevailing trend with pullbacks to key moving averages, structure, or order blocks.",
  "Breakout": "Identify high-volume breaks of key horizontal resistance, support, trendlines, or consolidation ranges.",
  "Support & Resistance": "Trade rejections and reversals from verified horizontal support or resistance levels.",
  "Market Structure": "Analyze BOS (Break of Structure), CHoCH (Change of Character), Higher Highs/Higher Lows or Lower Highs/Lower Lows.",
  "Liquidity / Price Action": "Detect liquidity sweeps of swing highs/lows, fair value gaps (FVG), and imbalance fills.",
  "Moving Average": "Analyze dynamic support/resistance from visible 20/50/200 MAs or EMA crossovers.",
  "RSI Confirmation": "Look for RSI divergence, overbought/oversold turns, and midline 50 bounces if indicators are visible.",
};

// POST /api/analyze-chart
app.post("/api/analyze-chart", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", strategy = "Smart AI" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No chart image provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server. Please check the Secrets settings.",
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const strategyGuidance = STRATEGY_PROMPTS[strategy] || STRATEGY_PROMPTS["Smart AI"];

    const prompt = `You are an elite quantitative chart analyst and institutional price action specialist.
Carefully examine this real trading chart image.

TASK:
1. Detect the exact Symbol/Ticker (e.g. XAUUSD, BTCUSDT, EURUSD, NVDA, AAPL, SPY, etc.) from the chart header, watermark, title bar, or symbol text. If not explicitly named, infer from typical asset behavior or label as "MARKET".
2. Detect the Timeframe (e.g., 1M, 5M, 15M, 30M, 1H, 4H, Daily, etc.).
3. Read the actual price numbers visible on the vertical price axis (Y-axis) and the current/latest visible price of the most recent candle.
4. Analyze the candlestick structure, trend, swing highs, swing lows, key support zones, and key resistance zones based on the selected strategy: "${strategy}".
Strategy guidance: ${strategyGuidance}

STRICT ACCURACY RULES:
- THE SIGNAL MUST EXACTLY MATCH THE UPLOADED CHART.
- Entry must be calculated from an ACTUAL price level visible on the uploaded chart.
- Never generate random, fictional, or placeholder prices.
- Calculate:
  * ONE Entry price
  * ONE Stop Loss price (SL placed logically beyond the relevant swing high/low, support, or resistance zone)
  * ONE Take Profit price (TP placed at a logical target, next liquidity pool, or key structure level)
  * Never provide multiple TP levels.
- Risk/Reward ratio must be mathematically consistent with Entry, SL, and TP (e.g. 1 : 2.0).
- If the chart does NOT provide sufficient clear information, is unreadable, or does NOT offer a high-probability trade setup, set isValidSetup to false, and set rejectionReason to: "Unable to determine a reliable setup from this chart." Do not invent or force a trade!
- Provide the estimated vertical percentage (from top 0% to bottom 100% of the image canvas) where:
  * entryYPercent (where Entry price level is located on the chart image)
  * slYPercent (where SL price level is located on the chart image)
  * tpYPercent (where TP price level is located on the chart image)
  * currentPriceYPercent (where latest price is located on the chart image)
  * minVisiblePrice (approximate lowest price visible on the vertical axis)
  * maxVisiblePrice (approximate highest price visible on the vertical axis)`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        systemInstruction:
          "You are a strict, professional institutional trading system. You strictly analyze only the real data present in the user's uploaded chart image. You never hallucinate price levels.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidSetup: {
              type: Type.BOOLEAN,
              description: "True if the chart contains a readable, high-quality setup. False if unreadable, ambiguous, or no reliable setup exists.",
            },
            rejectionReason: {
              type: Type.STRING,
              description: "If isValidSetup is false, clearly state 'Unable to determine a reliable setup from this chart.' followed by the reason.",
            },
            symbol: {
              type: Type.STRING,
              description: "Detected symbol or ticker (e.g. XAUUSD, BTCUSDT, EURUSD)",
            },
            timeframe: {
              type: Type.STRING,
              description: "Detected timeframe (e.g. 15M, 1H, 4H, 1D)",
            },
            direction: {
              type: Type.STRING,
              description: "Trade direction: BUY or SELL or NEUTRAL",
            },
            strategy: {
              type: Type.STRING,
              description: "The applied trading strategy",
            },
            currentPrice: {
              type: Type.NUMBER,
              description: "The current/latest visible price on the chart",
            },
            entry: {
              type: Type.NUMBER,
              description: "Exact Entry price based on chart structure",
            },
            stopLoss: {
              type: Type.NUMBER,
              description: "Exact Stop Loss price based on chart structure",
            },
            takeProfit: {
              type: Type.NUMBER,
              description: "Exact ONE Take Profit price target",
            },
            riskReward: {
              type: Type.STRING,
              description: "Formatted Risk/Reward ratio, e.g. '1 : 2.0'",
            },
            confidence: {
              type: Type.STRING,
              description: "High, Medium, or Low",
            },
            trend: {
              type: Type.STRING,
              description: "Bullish, Bearish, or Ranging",
            },
            marketStructure: {
              type: Type.STRING,
              description: "Detailed structure (e.g. Higher Highs & Higher Lows, Break of Structure, Bearish Order Block)",
            },
            keyLevels: {
              type: Type.OBJECT,
              properties: {
                support: { type: Type.STRING, description: "Identified support price level(s)" },
                resistance: { type: Type.STRING, description: "Identified resistance price level(s)" },
                swingHigh: { type: Type.STRING, description: "Recent swing high price level" },
                swingLow: { type: Type.STRING, description: "Recent swing low price level" },
              },
            },
            entryYPercent: {
              type: Type.NUMBER,
              description: "Vertical position percentage from top of image (0 to 100) for Entry line",
            },
            slYPercent: {
              type: Type.NUMBER,
              description: "Vertical position percentage from top of image (0 to 100) for Stop Loss line",
            },
            tpYPercent: {
              type: Type.NUMBER,
              description: "Vertical position percentage from top of image (0 to 100) for Take Profit line",
            },
            currentPriceYPercent: {
              type: Type.NUMBER,
              description: "Vertical position percentage from top of image (0 to 100) for Current Price",
            },
            minVisiblePrice: {
              type: Type.NUMBER,
              description: "Lowest price visible on the vertical axis",
            },
            maxVisiblePrice: {
              type: Type.NUMBER,
              description: "Highest price visible on the vertical axis",
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                structureBreakdown: {
                  type: Type.STRING,
                  description: "Concise breakdown of candle patterns and structure",
                },
                entryReason: {
                  type: Type.STRING,
                  description: "Specific reason for this exact Entry price",
                },
                stopLossReason: {
                  type: Type.STRING,
                  description: "Specific reason for this Stop Loss placement",
                },
                takeProfitReason: {
                  type: Type.STRING,
                  description: "Specific reason for this Take Profit target",
                },
                riskWarning: {
                  type: Type.STRING,
                  description: "Key invalidation condition or risk consideration",
                },
              },
              required: ["structureBreakdown", "entryReason", "stopLossReason", "takeProfitReason"],
            },
          },
          required: ["isValidSetup", "symbol", "timeframe", "direction", "confidence"],
        },
      },
    });

    const text = response.text || "";
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Failed to parse AI chart analysis response",
        raw: text,
      });
    }

    return res.json(data);
  } catch (error: unknown) {
    console.error("Error analyzing chart:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error analyzing chart";
    return res.status(500).json({
      error: errorMessage,
    });
  }
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Chart Scanner server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
