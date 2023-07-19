const MongoClient = require('mongodb').MongoClient

module.exports = {
    getCollection
}

async function getCollection(dbName, collectionName) {
    try {
        const db = await connect(dbName)
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        throw err
    }
}

var dbConnection = null

async function connect(dbName) {
    if (dbConnection) return dbConnection
    try {
        const client = await MongoClient.connect('mongodb+srv://israel:israel123@cluster0.syzvtaz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        dbConnection = client.db(dbName)
        return dbConnection
    } catch (err) {
        throw err
    }
}