export default class GenericSim {
    constructor() {
        if (new.target === GenericSim) {
            //throw new Error("The Generic Simulation cannot be instanciated.");
        }
    }

    abstractMethod() {
        throw new Error("Abstract method must be implemented.");
    }

    getSimulationTemplate(uid) {
        return "errorcard.ejs";
    }

    static getSimulationName() {
        return "Unnamed Simulation";
    }
}