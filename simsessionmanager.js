import GenericSim from "./sims/genericsim.js";
import { randomInt } from "node:crypto";

let simsessions = {};
let simulations = {
    "generic": GenericSim
}

export function getAvailableSimulations() {
    return Object.keys(simulations);
}

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

export function createSession(simulation, constructorData) {
    let code = generateCode();
    while (code in simsessions){
        code = generateCode();
    }
    if (simulation in simulations) {
        try {
            let session = new simulations[simulation](code, constructorData);
            simsessions[code] = session;
            return code;
        } catch (error) {
            console.error(error.message);
            return false;
        }
    }
    return false;
}

function generateCode(length = 6) {
    //const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //Alphanumeric
    const chars = '0123456789'; //Numeric
    return Array.from({ length }, () => chars[randomInt(chars.length)]).join('');
}