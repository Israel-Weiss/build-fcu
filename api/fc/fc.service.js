const { getCollection } = require('../../services/db.service')
const socketService = require('../../services/socket.service')

const dbName = 'hmiDB'

async function query(tower, floor = null) {
    try {
        let collection = await getCollection(dbName, _getCollectionName(tower))
        let fcsList = floor ? await collection.find({ floor }).toArray() : await collection.find({}).toArray()
        return fcsList
    } catch (err) {
        throw err
    }
}

async function getById(tower, fcId) {
    try {
        let collection = await getCollection(dbName, _getCollectionName(tower))
        const fc = await collection.findOne({ id: fcId })
        return fc
    } catch (err) {
        throw err
    }

}


async function updateAll(tower, fcs) {
    try {
        console.log('updateAll 1');
        let collection = await getCollection(dbName, _getCollectionName(tower))
        await collection.insertMany(fcs)
        await collection.deleteMany({ version: 0 })
        await collection.updateMany({}, { $set: { version: 0 } })
        const newList = await query(tower)
        console.log('updateAll 2', tower);
        return newList
    } catch (err) {
        throw err
    }
}

async function createCollection(tower, fcs) {
    try {
        let collection = await getCollection(dbName, _getCollectionName(tower))
        await collection.deleteMany({})
        await collection.insertMany(fcs)
        const newList = await query(tower)
        return newList
    } catch (err) {
        throw err
    }
}

async function update(tower, fcId, field, val) {
    try {
        let collection = await getCollection(dbName, _getCollectionName(tower))
        switch (field) {
            case 'com':
                const status = _createStatus(val)
                await collection.updateOne({ id: fcId }, { $set: { comand: val, status: status } })
                break;
            case 'mode':
                await collection.updateOne({ id: fcId }, { $set: { mode: val } })
                break;
            case 'fan':
                await collection.updateOne({ id: fcId }, { $set: { fan: val } })
                break;
            case 'time-alarm':
                await collection.updateOne({ id: fcId }, { $set: { timeToAlarm: val } })
                break;
            case 'alarm':
                await collection.updateOne({ id: fcId }, { $set: { alarm: val } })
                break;
            case 'temp-sp':
                await collection.updateOne({ id: fcId }, { $set: { spTemp: val } })
                break;
            case 'interval-alarm':
                await collection.updateOne({ id: fcId }, { $set: { intervalToAlarm: val } })
                break;
            case 'tempAlarm':
                await collection.updateOne({ id: fcId }, { $set: { tempAlarm: val } })
                break;
            case 'startAlarm':
                await collection.updateOne({ id: fcId }, { $set: { alarm: 1, tempAlarm: val } })
                break;
            case 'endAlarm':
                await collection.updateOne({ id: fcId }, { $set: { alarm: 0, tempAlarm: { status: 1, highTempId: null, lowTempId: null } } })
                break;
        }
        const newFc = await getById(tower, fcId)
        socketService.emitRender(`fcs-${tower}-${newFc.floor}`)
        return newFc
    } catch (err) {
        throw err
    }
}

async function closeAllAlarms(towerName) {
    try {
        let collection = await getCollection(dbName, _getCollectionName(towerName))
        collection.updateMany({}, { $set: { alarm: 0, tempAlarm: { status: 0, highTempId: null, lowTempId: null } } })
    } catch (err) {
        throw err
    }
}

function _createStatus(com) {
    if (com === 0) return 0
    if (com === 1) return 1
    return _getRandomIntInclusive(0, 1)
}

function _getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function _getCollectionName(towerName) {
    return `fc-${towerName.toLowerCase()}`
}

module.exports = {
    query,
    getById,
    update,
    updateAll,
    closeAllAlarms,
    createCollection
}




