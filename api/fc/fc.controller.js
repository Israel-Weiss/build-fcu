const fcService = require('./fc.service')
const tempService = require('../../services/temp.service')

async function getFcs(req, res) {
    try {
        const { tower, floor } = req.query
        const fcs = await fcService.query(tower, floor)
        res.send(fcs)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find fan coil units' })
    }
}

async function getFc(req, res) {
    try {
        const fcId = req.params.id
        const { tower } = req.query
        const fc = await fcService.getById(tower, fcId)

        res.send(fc)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find fan coil unit' })
    }
}

async function updateFc(req, res) {
    try {
        const fcId = req.params.id
        const { tower } = req.query
        const { field, val } = req.body
        const newFc = field === 'interval-alarm' || field === 'temp-sp'
            ? await tempService.updateSpecial(tower, fcId, field, val)
            : await fcService.update(tower, fcId, field, val)
        res.send(newFc)
    } catch (err) {
        res.status(500).send({ err: 'Failed to update fan coil unit' })
    }
}

module.exports = {
    getFcs,
    getFc,
    updateFc
}
