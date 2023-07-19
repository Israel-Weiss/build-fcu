const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')

const tempService = require('./services/temp.service')
const timeService = require('./services/time.service')

const fcRoutes = require('./api/fc/fc.routes')
const alarmRouts = require('./api/alarm/alarm.routes')
const userRouts = require('./api/user/user.routes')
const { setupSocketAPI } = require('./services/socket.service')
const app = require('express')()
const http = require('http').createServer(app)

app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))
setupSocketAPI(http)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

tempService.startTempInterval()
timeService.startTimeInterval()


const port = process.env.PORT || 3030
http.listen(port, () => console.log('Server is running on port: ' + port))

app.use('/api/fc', fcRoutes)
app.use('/api/alarm', alarmRouts)
app.use('/api/user', userRouts)

app.get('/**', (req, res) => {
 res.sendFile(path.join(__dirname, 'public', 'index.html'))
})




