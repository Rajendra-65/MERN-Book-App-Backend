import express from "express";
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors"

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)

app.listen(PORT,'0.0.0.0',()=>{
    console.log(`server is running on port ${PORT}`)
    connectDB()
})