const express = require('express')
const router = express.Router()
const usersController = require('../controllers/notes/index')

router.route('/')
  .get(usersController.getAllNotes)
  .post(usersController.createNewNote)
  .patch(usersController.updateNote)
  .delete(usersController.deleteNote)

// router.route('/:id')
//   .get(usersController.getSpecificNote);

module.exports = router