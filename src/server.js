import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { validateEnv } from "./utils/validateEnv.js";
import dns from "node:dns/promises";

dns.setServers (["8.8.8.8", "1.1.1.1"]);

// Run validation and connection
validateEnv();
connectDB();

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;