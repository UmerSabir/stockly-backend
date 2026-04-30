import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
import { validateEnv } from "./utils/validateEnv.js";

const PORT = process.env.PORT || 5000;

connectDB();
dotenv.config();
validateEnv();

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;