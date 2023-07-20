const socketService = require('./socket.service')

var gDate = new Date()

const startTimeInterval = () => {
    const intervalId = setInterval(() => {
        gDate = new Date()
        socketService.emitTime(gDate.toLocaleTimeString('it-IT', { timeZone: 'Asia/Jerusalem' }), gDate.toLocaleDateString("en-GB", { timeZone: 'Asia/Jerusalem' }))
    }, 1000)
}

module.exports = {
    startTimeInterval
}
