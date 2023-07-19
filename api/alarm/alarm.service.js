const { getCollection } = require('../../services/db.service')
const socketService = require('../../services/socket.service')

const fcService = require('../fc/fc.service')
const dbName = 'hmiDB'

module.exports = {
    query,
    addAlarm,
    endAlarm,
    endAll,
    ackAlarm,
    ackAll
}

async function query() {
    try {
        let collection = await getCollection(dbName, 'alarm')
        let alarms = await collection.find({}).sort({ startTime: -1 }).limit(4000).toArray()
        return alarms
    } catch (err) {
        throw err
    }
}

async function addAlarm(towerName, fcId, typeAlarm) {
    try {
        const fc = await fcService.getById(towerName, fcId)
        const alarm = _createTempAlarm(towerName, fc, typeAlarm)
        let collection = await getCollection(dbName, 'alarm')
        await collection.insertOne(alarm)

        socketService.emitRender('alarm')
        socketService.emitRender(`fcs-${towerName}-${fc.floor}`)
        return alarm.id
    } catch (err) {
        throw err
    }
}

async function endAlarm(alarmId) {
    try {
        let collection = await getCollection(dbName, 'alarm')
        await collection.updateOne({ id: alarmId, acknolage: false }, { $set: { activation: false, alarmStatus: 2, endTime: new Date().toLocaleString('en-GB') } })
        await collection.deleteOne({ id: alarmId, acknolage: true })
        socketService.emitRender('alarm')
        return
    } catch (err) {
        throw err
    }
}

async function endAll() {
    try {
        let collection = await getCollection(dbName, 'alarm')
        await collection.updateMany({ acknolage: false }, { $set: { activation: false, alarmStatus: 2, endTime: new Date().toLocaleString('en-GB') } })
        await collection.deleteMany({ acknolage: true })
        socketService.emitRender('alarm')
        return
    } catch (err) {
        throw err
    }
}

async function ackAlarm(alarmId) {
    try {
        let collection = await getCollection(dbName, 'alarm')
        await collection.updateOne({ id: alarmId, activation: true }, { $set: { acknolage: true, alarmStatus: 3, ackTime: new Date().toLocaleString('en-GB') } })
        await collection.deleteOne({ id: alarmId, activation: false })
        socketService.emitRender('alarm')
        return
    } catch (err) {
        throw err
    }
}

async function ackAll() {
    try {
        let collection = await getCollection(dbName, 'alarm')
        await collection.updateMany({ activation: true }, { $set: { acknolage: true, alarmStatus: 3, ackTime: new Date().toLocaleString('en-GB') } })
        await collection.deleteMany({ activation: false })
        socketService.emitRender('alarm')
        return
    } catch (err) {
        throw err
    }
}


function _createTempAlarm(towerName, fc, typeAlarm) {
    const alarmDescription = typeAlarm === 'high' ? 'High temperature' : 'Low temperature'
    const alarm = {
        id: _makeId(12),
        fc: {
            towerName,
            id: fc.id
        },
        alarmStatus: 1,
        startTime: new Date().toLocaleString('en-GB'),
        activation: true,
        endTime: null,
        acknolage: false,
        ackTime: null,
        display: true,
        zone: towerName,
        family: 'AC',
        txt: `Tower ${towerName} floor ${+fc.floor.substring(2, 4)} - ${fc.description} - ${alarmDescription}`
    }
    return alarm
}

function _makeId(length = 6) {
    let idText = ''
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        var char = chars.charAt(Math.floor(Math.random() * (chars.length)))
        idText += char
    }
    return idText
}

// removeAll()
// async function removeAll() {
//     try {
//         let collection = await getCollection(dbName, 'alarm')
//         await collection.deleteMany({})
//         socketService.emitRender('alarm')
//         return
//     } catch (err) {
//         throw err
//     }
// }

// async function headenAlarm(alarmId) {
//     let collection = await getCollection(dbName, 'alarm')
//     await collection.updateOne({ id: alarmId }, { $set: { display: false } })
//     socketService.emitRender('alarm')
//     return
// }

// async function headenAll() {
//     let collection = await getCollection(dbName, 'alarm')
//     await collection.updateMany({ display: true }, { $set: { display: false } })
//     socketService.emitRender('alarm')
//     return
// }

// async function showAlarm(alarmId) {
//     let collection = await getCollection(dbName, 'alarm')
//     await collection.updateOne({ id: alarmId }, { $set: { display: true } })
//     socketService.emitRender('alarm')
//     return
// }

// async function showAll() {
//     let collection = await getCollection(dbName, 'alarm')
//     await collection.updateOne({ id: alarmId }, { $set: { display: true } })
//     await collection.updateMany({ display: false }, { $set: { display: true } })
//     socketService.emitRender('alarm')
//     return
// }

