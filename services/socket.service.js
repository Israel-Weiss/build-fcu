var gIo

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*'
        }
    })
    console.log('setupSocketAPI');
    gIo.on('connection', socket => {
        console.log(`New connected socket ${socket.id}`)
        socket.on('disconnect', socket => {
            console.log(`Socket  ${socket.id} is leaving`);
        })
    })
}

function emitRender(type) {
    gIo.emit(type)
}

function emitTime(date, time) {
    gIo.emit('time', {date, time})
}

module.exports = {
    setupSocketAPI,
    emitRender,
    emitTime
}