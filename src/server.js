import dotenv from "dotenv";
import { validateEnv } from "./utils/validateEnv.js";
import connectDB from "./config/db.js";
import app from "./app.js";

// MUST load env variables FIRST before anything else
dotenv.config();
validateEnv();

const PORT = process.env.PORT || 5000;

// Connect to database after env variables are loaded
connectDB();

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;