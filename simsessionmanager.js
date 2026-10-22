import session from "express-session";
import GenericSim from "./sims/genericsim.js";

let simsessions = {
    "ABC123": new GenericSim(),
};

export function checkSession(session) {
    session = session.toUpperCase();
    if (session in simsessions) {
        return true;
    }
    return false;
}

export function getSimulationBySID(sid) {
    sid = sid.toUpperCase();
    if (sid in simsessions) {
        return simsessions[sid];
    }
    return false;
}

export function getSimulationNameBySID(sid) {
    sid = sid.toUpperCase();
    if (sid in simsessions) {
        return simsessions[sid].constructor.getSimulationName();
    }
    return "";
}

function addSession(session) {
    //sessions.push(session.toUpperCase());
}