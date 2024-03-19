const fs = require('fs');

const logsPath = "logs.text";
const now = ()=> new Date().toLocaleTimeString([], { hour12: false });

function logSessionStart(){
    const time = now();
    log("^^^^^^ NEW SESSION [" + time + "] ^^^^^^\n");
}

function log(msg) {
    console.log(msg);
    const time = now();
    writeToLogs(`[${time}]:: ${msg}`);
}

function writeToLogs(content) {
    fs.readFile(logsPath, 'utf8', (err, existingContent) => {
        fs.writeFile("logs.text", content + "\n"+ existingContent, (err) => {
            if (err) {
                console.error('Error writing to logs:', err);
                return;
            }
        });
        if (err)
            return;
    });
}

module.exports = { log, logSessionStart }