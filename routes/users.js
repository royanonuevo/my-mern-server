const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users/index')

router.route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)

router.route('/:id')
  .get(usersController.getSpecificUser);

module.exports = router