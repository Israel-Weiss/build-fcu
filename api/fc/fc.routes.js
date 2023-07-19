const express = require('express')
const { getFcs, getFc, updateFc } = require('./fc.controller')

const router = express.Router()

router.get('/', getFcs)
router.get('/:id', getFc)
router.put('/:id', updateFc)

module.exports = router


