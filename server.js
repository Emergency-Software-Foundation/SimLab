import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import {checkSession} from "./sessionmanager.js";import { fileURLToPath } from 'url';
import { dirname } from 'path';

//polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const web = express();
const server = http.createServer(web);
const WebPort = 8081;
const SocketPort = 8082;
const io = new Server(server, { cors: { origin: "*" } });

let art = `
			      (c) 2026 Toby McDonald
`;

const sessionMiddleware = session({
  secret: 'flower-watermellon-zuchini-centrifuge',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 6000000 // 100 minutes
  }
});
web.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

web.set('view engine', 'ejs');
web.set('views', __dirname + '/views');
web.use(express.static(__dirname + '/static'));

web.get('/joinsession', (req, res) => {
  if (!Object.hasOwn(req.query, 'sid')) {
		res.status(400).json({
			"error": 400,
			"message": "Missing simulation id from request."
		});
	} else if (checkSession(req.query.sid)) {
    req.session.user = {id: randomUUID(), sid: req.query.sid};
    res.json(req.session);
    res.status(200).json({
			"message": "Joined session."
		});
  } else {
    res.status(404).json({
			"error": 404,
			"message": "Simulation session not found."
		});
  }
});

web.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.send('Logged out');
  });
});

//Error handling
web.use((req, res, next) => {
	res.status(404).json({
		"error": 404,
		"message": "That endpoint does not exist."
	});
});
web.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		"error": 500,
		"message": "A server error has occured."
	});
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

let webready = false;
web.listen(WebPort, () => {
    console.log('SERVER > ExpressJS Server Ready.')
    webready = true;
	isReady();
});
let socketready = false;
server.listen(SocketPort, () => {
    console.log('SERVER > Socket.io Server Ready');
    socketready = true;
    isReady();
});
let serverready = false;
function isReady() {
    if (!serverready && socketready && webready) {
        serverready = true;
        console.log('SERVER > Application Ready.')
        console.log(art);
    }
}
