const socketService = require('./socket.service')

var gDate = new Date()

const startTimeInterval = () => {
    const intervalId = setInterval(() => {
        gDate = new Date()
        socketService.emitTime(gDate.toLocaleTimeString('it-IT'), gDate.toLocaleDateString("en-GB"))
    }, 1000)
}

module.exports = {
    startTimeInterval
}
