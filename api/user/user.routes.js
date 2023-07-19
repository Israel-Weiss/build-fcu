const express = require('express')
const { getUsers, getUserById, getUserByParams, updateUser, addUser, removeUser } = require('./user.controller')

const router = express.Router()

router.get('/', getUsers)
router.get('/check', getUserByParams)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.post('/', addUser)
router.delete('/:id', removeUser)

module.exports = router


