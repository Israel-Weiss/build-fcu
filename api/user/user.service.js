const { getCollection } = require('../../services/db.service')
const socketService = require('../../services/socket.service')

const dbName = 'hmiDB'

async function query() {
    try {
        let collection = await getCollection(dbName, 'user')
        let users = await collection.find({}).toArray()
        return users
    } catch (err) {
        throw err
    }
}

async function getById(userId) {
    try {
        let collection = await getCollection(dbName, 'user')
        const user = await collection.findOne({ id: userId })
        return user
    } catch (err) {
        throw err
    }
}

async function getByParams(userName, password) {
    try {
        let collection = await getCollection(dbName, 'user')
        const user = await collection.findOne({ name: { $regex: userName, $options: 'i' }, password: password })
        return user
    } catch (err) {
        throw err
    }
}

async function update(userId, password, authorization) {
    try {
        let collection = await getCollection(dbName, 'user')
        await collection.updateOne({ id: userId }, { $set: { password: password, authorization: authorization } })
        const newUser = await getById(userId)
        socketService.emitRender(`user`)
        return newUser
    } catch (err) {
        throw err
    }
}

async function add(name, password, authorization) {
    try {
        const newUser = { id: _makeId(), name, authorization, password, default: false }
        let collection = await getCollection(dbName, 'user')
        await collection.insertOne(newUser)
        socketService.emitRender(`user`)
        return await getById(newUser.id)
    } catch (err) {
        throw err
    }
}

async function remove(userId) {
    try {
        let collection = await getCollection(dbName, 'user')
        collection.deleteOne({ id: userId })
        socketService.emitRender(`user`)
        return
    } catch (err) {
        throw err
    }
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
module.exports = {
    query,
    getById,
    getByParams,
    update,
    add,
    remove
}


// createDefaultUsers()
// async function createDefaultUsers() {
//     let collection = await getCollection(dbName, 'user')
//     const usersList = [
//         { id: _makeId(), name: 'View', authorization: 0, password: '1111', default: true },
//         { id: _makeId(), name: 'Operator', authorization: 1, password: '2222', default: true },
//         { id: _makeId(), name: 'Admin', authorization: 2, password: '3333', default: true }
//     ]
//     await collection.deleteMany({})
//     await collection.insertMany(usersList)
//     return await query()
// }






