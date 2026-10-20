let sessions = ["ABC123","CBA321"];

export function checkSession(session) {
    session = session.toUpperCase();
    if (sessions.includes(session)) {
        return true;
    }
    return false;
}

function addSession(session) {
    sessions.push(session.toUpperCase());
}