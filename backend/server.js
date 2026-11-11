const bodyParser = require("body-parser");
const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

const app = express();
const PORT=process.env.PORT || 5000;

app.use(cors());
app.use (bodyParser.json());

const uri = "mongodb://localhost:27017/stock_market_portfolio"
mongoose
.connect(uri)
.then(()=>console.log("MongoDB connected."))
.catch((err)=> {
    console.err("MongoDB connection error:",err);
    process.exit(1);
});

const stockSchema = new mongoose.Schema({
    company: String,
    description: String,
    initial_price: Number,
    price_2002: Number,
    price_2007: Number,
    symbol: String,
});

const Stock = mongoose.model("Stock", stockSchema, "stocks");

const watchlistSchema = new mongoose.Schema({
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
    addedAt: { type: Date, default: Date.now },
});
const Watchlist =mongoose.model("Watchlist", watchlistSchema);

app.get("/api/stocks", async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/watchlist", async (req, res) => {
    try {
        const list = await Watchlist.find().populate("stockId");
        console.log("in watchlist route", list)
        
        res.json(list);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/api/watchlist", async (req, res) => {
  try {
    const { stockId } = req.body;
    const exists = await Watchlist.findOne({ stockId });
    if (exists) return res.json({ message: "Already in watchlist" });
    const item = new Watchlist({ stockId });
    await item.save();
    res.json({ message: "Added to watchlist" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});