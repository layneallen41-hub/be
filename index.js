import express from "express";
import cors from "cors";
// import { MongoClient } from "mongodb";
import dotenv from "dotenv";


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


// const client = new MongoClient(process.env.MONGO_URL);
console.log("\n\nEnvironment45")
// console.log(client)



app.post("/api/save", async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { u, i } = req.body;


    if (!u) return res.status(400).send("Missing text");
    console.log("\n\nUSER INPUT");
    console.log(u)


    // Get existing attempt count
    // const record = await attempts.findOne({ ipaddress });
    // const count = record?.count || 0;


    // if (count >= 10) {
    //     return res.status(429).send("Max attempts reached (10)");
    // }


    // Insert entry
    // await collection.insertOne({ text, ipaddress, timestamp: new Date() });


    // Update attempts
    // await attempts.updateOne(
    //     { ipaddress },
    //     { $set: { ipaddress }, $inc: { count: 1 } },
    //     { upsert: true }
    // );


    res.sendStatus(200);
});


app.listen(4000, () => console.log("Server running on port 4000"));
