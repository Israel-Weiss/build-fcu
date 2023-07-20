const fcService = require('../api/fc/fc.service')
const alarmService = require('../api/alarm/alarm.service')
const socketService = require('./socket.service')

const towerNames = ['A', 'B', 'C', 'D']
let timeoutIds
let intervalId

async function startTempInterval() {
    await _resetAppTemp()
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(async () => {
        for (var i = 0; i < towerNames.length; i++) {
            await _setTowerTemp(towerNames[i])
        }
        socketService.emitRender('fcsList')
    }, 300 * 1000)
}

async function _setTowerTemp(towerName) {
    const fcsList = await fcService.query(towerName)
    const upTempFcs = fcsList.map(fc => {
        fc.temp = _createTemp(fc.temp, fc.spTemp)
        fc.version = 1
        delete fc._id
        return fc
    })
    const upAlarmFcs = _getTowerListUpAlarms(upTempFcs, towerName)
    await fcService.updateAll(towerName, upAlarmFcs)
}

function _createTemp(val, sp) {
    let num = _getRandomIntInclusive(1, 60)
    const interval = Math.abs(val - sp)
    if (interval < 2) return _getNextTemp(num, val)
    if ((interval > 5) && (num < 54)) return val
    return sp
}

function _getNextTemp(num, val) {
    let newVal
    if (num < 24) newVal = val + 1
    else if (num < 42) newVal = val - 1
    else if (num < 60) newVal = val
    else newVal = _getRandomIntInclusive(0, 50)
    return newVal
}

function _getTowerListUpAlarms(fcsList, towerName) {
    const nweList = fcsList.map(curFc => {
        const intervalAlarm = curFc.intervalToAlarm <= Math.abs(curFc.temp - curFc.spTemp) ? true : false
        if ((!intervalAlarm && curFc.alarm === 0) || (intervalAlarm && curFc.alarm > 0)) {
            return curFc
        }
        if (intervalAlarm) {
            const typeAlarm = curFc.temp > curFc.spTemp ? 'high' : 'low'
            _startTimeout(towerName, curFc, typeAlarm)
            curFc.alarm = 2
        }
        else if (curFc.alarm === 2) {
            _stopTimeout(curFc.id)
            curFc.alarm = 0
        }
        else {
            _endAlarm(curFc)
            curFc.alarm = 0
            curFc.tempAlarm = { status: 0, highTempId: null, lowTempId: null }
        }
        return curFc
    })
    return nweList
}

async function _resetAppTemp() {
    await _createTimeoutIds()
    alarmService.endAll()
    for (var i = 0; i < towerNames.length; i++) {
        await fcService.closeAllAlarms(towerNames[i])
        await _setTowerTemp(towerNames[i])
    }
}

function _startTimeout(towerName, fc, typeAlarm) {
    const timeoutIdx = timeoutIds.findIndex(timeoutId => timeoutId.id === fc.id)

    timeoutIds[timeoutIdx].timeout = setTimeout(() => {
        _openAlarm(towerName, fc.id, typeAlarm)
    }, fc.timeToAlarm * 1000)
}

function _stopTimeout(fcId) {
    const timeoutIdx = timeoutIds.findIndex(timeoutId => timeoutId.id === fcId)
    clearTimeout(timeoutIds[timeoutIdx].timeout)
}

async function _openAlarm(towerName, fcId, typeAlarm) {
    const alarmId = await alarmService.addAlarm(towerName, fcId, typeAlarm)
    const tempAlarm = typeAlarm === 'high' 
    ? { status: 1, highTempId: alarmId, lowTempId: null } 
    : { status: 2, highTempId: null, lowTempId: alarmId }
    fcService.update(towerName, fcId, 'startAlarm', tempAlarm)
}

async function _closeAlarm(towerName, fc) {
    _endAlarm(fc)
    fcService.update(towerName, fc.id, 'endAlarm')
}

async function _endAlarm(fc) {
    if (fc.tempAlarm.highTempId) await alarmService.endAlarm(fc.tempAlarm.highTempId)
    else await alarmService.endAlarm(fc.tempAlarm.lowTempId)
}

async function updateSpecial(tower, fcId, field, val) {
    switch (field) {
        case 'temp-sp':
            await fcService.update(tower, fcId, 'temp-sp', val)
            break;
        case 'interval-alarm':
            await fcService.update(tower, fcId, 'interval-alarm', val)
            break;
    }
    await _updateAlarm(tower, fcId)
    const newFc = await fcService.getById(tower, fcId)
    return newFc
}

async function _updateAlarm(towerName, fcId) {
    let fc = await fcService.getById(towerName, fcId)
    const deviationAlarm = fc.intervalToAlarm <= Math.abs(fc.temp - fc.spTemp) ? true : false
    if ((!deviationAlarm && fc.alarm === 0)
        || (deviationAlarm && fc.alarm > 0)) return

    if (deviationAlarm) {
        const typeAlarm = fc.temp > fc.spTemp ? 'high' : 'low'
        _startTimeout(towerName, fc, typeAlarm)
        await fcService.update(towerName, fc.id, 'alarm', 2)
    }
    else if (fc.alarm === 2) {
        _stopTimeout(fc.id)
        await fcService.update(towerName, fc.id, 'alarm', 0)
    }
    else _closeAlarm(towerName, fc)
}

async function _createTimeoutIds() {
    timeoutIds = []
    for (var i = 0; i < towerNames.length; i++) {
        const fcs = await fcService.query(towerNames[i])
        fcs.forEach(fc => timeoutIds.push({ id: fc.id, timeout: null }))
    }
    return timeoutIds
}

function _getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
    startTempInterval,
    updateSpecial
}








