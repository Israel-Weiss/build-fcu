const userService = require('./user.service')

async function getUsers(req, res) {
    try {
        const { grup } = req.query
        const users = await userService.query(grup)
        res.send(users)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find users list' })
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.id
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find user' })
    }
}

async function getUserByParams(req, res) {
    try {
        const { userName, password } = req.query
        const user = await userService.getByParams(userName, password)
        res.send(user)
    } catch (err) {
        res.status(500).send({ err: 'Failed to find user' })
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.params.id
        const { password, authorization } = req.body
        const newUser = await userService.update(userId, password, authorization)
        res.send(newUser)
    } catch (err) {
        res.status(500).send({ err: 'Failed to update user' })
    }
}

async function addUser(req, res) {
    try {
        const { name, password, authorization } = req.body
        const newUser = await userService.add(name, password, authorization)
        res.send(newUser)
    } catch (err) {
        res.status(500).send({ err: 'Failed to add user' })
    }
}

async function removeUser(req, res) {
    try {
        const userId = req.params.id
        console.log('removeUser', userId);
        await userService.remove(userId)
        res.send('Succesffully')
    } catch (err) {
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

module.exports = {
    getUsers,
    getUserById,
    getUserByParams,
    updateUser,
    addUser,
    removeUser
}
