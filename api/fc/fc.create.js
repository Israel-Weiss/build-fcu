const fs = require ('fs')
const fcService = require('./fc.service')
const desImport = require ('../../data/descriptios')
const { log } = require('console')
const towerNames = ['A', 'B', 'C', 'D']
const allFcsDes = [desImport.fcsDesA, desImport.fcsDesB, desImport.fcsDesC, desImport.fcsDesD]

createJsonFiles()

async function createJsonFiles() {
    for (var i = 0; i < allFcsDes.length; i++) {
        let towerName = towerNames[i]
        let towerDesObj = allFcsDes[i]
        let fcs = []
        for (const floor in towerDesObj) {
            let flFcs = _createFloor(towerDesObj[floor], towerName, floor)
            fcs.push(...flFcs)
        }
        await fcService.createCollection(towerName, fcs)
        console.log(towerName)
    }
}

function _createFloor(flDes, towerName, floor) {
    let fcs = []
    let num = (+floor.replace('fl', '')) * 100
    for (var i = 0; i < flDes.length; i++) {
        let stNum = '' + num
        let newNum = stNum.padStart(4, 0)
        const com = getRandomIntInclusive(0, 2)
        let temp = getRandomIntInclusive(16, 25)
        let fc = {
            id: _makeId(),
            floor,
            num: towerName + newNum,
            description: flDes[i],
            comand: com,
            status: createStatus(com),
            temp,
            spTemp: temp + 1,
            mode: getRandomIntInclusive(0, 3),
            fan: getRandomIntInclusive(0, 3),
            intervalToAlarm: getRandomIntInclusive(3, 4),
            timeToAlarm: 10,
            alarm: 0,
            tempAlarm: {
                status: 0,
                highTempId: null,
                lowTempId: null
            },
            version: 0
        }
        fcs.push(fc)
        num++
    }
    return fcs
}

function createStatus(com) {
    if (com === 0) return 0
    if (com === 1) return 1
    return getRandomIntInclusive(0, 1)
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

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

