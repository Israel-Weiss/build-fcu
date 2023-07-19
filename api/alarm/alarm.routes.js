const express = require('express')
const { getAlarms, updateAlarm, updateAll } = require('./alarm.controller')
const router = express.Router()


router.get('/', getAlarms)
router.put('/', updateAll)
router.put('/:id',updateAlarm)

module.exports = router