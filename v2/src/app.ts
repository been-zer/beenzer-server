// import and run server
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import { socketConnect } from './sockets';
// import { getTime } from './utils';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @description Create express server
 * @date 12/1/2022 - 11:24:13 AM
 *
 * @type {express.Application}
 */
export const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Beenzer Server</h1>');
});

/**
 * @description Create http server
 * @date 12/1/2022 - 11:24:13 AM
 *
 * @type {any}
 */
export const server: any = createServer(app);

/**
 * @description Create socket server
 * @date 12/1/2022 - 11:24:13 AM
 *
 * @type {Server}
 */
export const io: any = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
