import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import {checkSession, getSimulationBySID, getSimulationNameBySID} from "./simsessionmanager.js";import { fileURLToPath } from 'url';
import { dirname } from 'path';
import favicon from 'serve-favicon';
import fs from 'fs';

//polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const web = express();
const server = http.createServer(web);
const WebPort = 8081;
const SocketPort = 8082;
const io = new Server(server, { cors: { origin: "*" } });

let art = `
                        :: eSimLab ::
	  (c) ${(new Date().getFullYear())} Emergency Software Foundation
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
web.use(favicon(__dirname + '/static/favicon.ico'));
web.use(express.static(__dirname + '/static'));
web.use(detectClientType);

web.get('/', (req, res, next) => {
  if (!req.session.user) {
    res.render('pagewrapper', {content:'join.ejs', contentData: {pageTitle: "Join a Simulation"}});
    return;
  }
  let simulation = getSimulationBySID(req.session?.user?.sid??"")??{};
  console.log(simulation);
  let contentData = {
    session: req.session,
    simulation: simulation,
    pageTitle: getSimulationNameBySID(req.session.user.sid),
    simTitle: getSimulationNameBySID(req.session.user.sid),
    simTemplate: simulation.getSimulationTemplate(req.session.user.id)
  };
  if (!fs.existsSync(__dirname + '/views/' + contentData.simTemplate)) {
    contentData.simTemplate = "errorcard.ejs";
  }
  res.render('simwrapper', {content:'tbd', contentData});
});

web.get('/joinsession', (req, res) => {
  if (!Object.hasOwn(req.query, 'sid')) {
		if (req.clientType === 'api') {
      res.status(400).json({
        "error": 400,
        "message": "Missing simulation id from request."
      });
    } else {
      res.redirect("/");
    }
	} else if (checkSession(req.query.sid)) {
    req.session.user = {id: randomUUID(), sid: req.query.sid};
    if (req.clientType === 'api') {
      res.status(200).json({
        "message": "Joined session."
      });
    } else {
      res.redirect("/");
    }
  } else {
    if (req.clientType === 'api') {
      res.status(404).json({
        "error": 404,
        "message": "Simulation session not found."
      });
    } else {
      //TODO: we should find a way to pass the not found message to the front page
      res.redirect("/");
    }
  }
});

web.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    if (req.clientType === 'api') {
      res.json({
        "message": 'Logged out successfully'
      });
    } else {
      res.redirect("/");
    }
  });
});

//Error handling
web.use((req, res, next) => {
  if (req.clientType === 'api') {
    res.status(404).json({
      "error": 404,
      "message": "That endpoint does not exist."
    });
  } else {
    res.status(404).render('pagewrapper', {
      content:'notfound.ejs',
      contentData: {
        pageTitle: "Page not found",
        session: req.session,
        simTitle: getSimulationNameBySID(req.session.user.sid??"")
      }
    });
  }
});
web.use((err, req, res, next) => {
	console.error(err.stack);
	if (req.clientType === 'api') {
    res.status(500).json({
      "error": 500,
      "message": "An internal server error has occured."
    });
  } else {
    res.status(500).render('error');
  }
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

function detectClientType(req, res, next) {
    // Check Accept header
    if (req.accepts('json') && !req.accepts('html')) {
        req.clientType = 'api';
    } else if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
        req.clientType = 'api';
    } else {
        req.clientType = 'web';
    }
    next();
}