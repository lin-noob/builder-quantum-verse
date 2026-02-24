import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = registerRoutes(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server started on port ${PORT}`);
});
