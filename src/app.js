import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
      origin: "http://localhost:5175",
      credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRouter from "./routes/auth.route.js";

app.use("/api/v1/auth", authRouter)

export default app;