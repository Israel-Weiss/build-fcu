const alarmService = require('./alarm.service')

async function getAlarms(req, res) {
    try {
        const alarms = await alarmService.query()
        res.send(alarms)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find alarms' })
    }
}

async function updateAlarm(req, res) {
    try {
        const alarmId = req.params.id
        const { field } = req.body

        const newAlarm = field === 'ack'
            ? await alarmService.ackAlarm(alarmId)
            : await alarmService.endAlarm(alarmId)

        res.send(newAlarm)
    } catch (err) {
        res.status(500).send({ err: 'Failed to update alarm' })
    }
}

async function updateAll(req, res) {
    try {
        const newList = await alarmService.ackAll()
        res.send(newList)
    } catch (err) {
        res.status(500).send({ err: 'Failed to acknolage alarms' })
    }
}


module.exports = {
    getAlarms,
    updateAlarm,
    updateAll
}