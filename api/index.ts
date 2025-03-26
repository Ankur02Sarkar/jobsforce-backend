import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file
const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Express on Vercel" });
});

const PORT = process.env.PORT || 3000; // Use port from env or default to 3000
app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

export default app;