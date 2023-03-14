// import and run server
import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

export const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Beenzer Server</h1>");
});

export const server: any = createServer(app);

export const io: any = new Server(server, {
  cors: {
    origin: [
      "*", // Remove in production
      String(process.env.CLIENT_APP_URL),
      String(process.env.CLIENT_DAO_URL),
      String(process.env.CLIENT_MARKET_URL),
    ],
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e9, // 0.93 gigabyte
  pingTimeout: 20,
});
