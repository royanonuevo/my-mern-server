const UserModel = require('../../models/User')
const NoteModel = require('../../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')


const _findDuplicate = (username) => {
  return UserModel.findOne({ username }).select('-password').lean().exec()
}
const _findUserById = (id) => {
  return UserModel.findById(id).exec()
}


// @desc Get All Users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find().select('-password').lean()
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' })
  }
  
  res.json(users)
})


// @desc Get Specific User
// @route GET /user/:id
// @access Private
const getSpecificUser = asyncHandler(async (req, res) => {
  
})



// @desc Create New User
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body

  // Validate Data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  // Check for duplicates
  const duplicate = await _findDuplicate(username)
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate username.', duplicate })
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10) // salt rounds

  const newUserObj = {
    username,
    password: hashedPassword,
    roles
  }

  // Create and Store new User
  const newUser = await UserModel.create(newUserObj)

  if (newUser) {
    res.status(201).json({ message: `New user ${username} created.` })
  } else {
    res.status(400).json({ message: `Invalid user data.` })
  }
})



// @desc Update User
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body

  // Validate Data
  if (!id || !username || !password || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID.' })
  }

  // Check if User Exists
  const foundUser = await _findUserById(id)
  if (!foundUser) {
    return res.status(400).json({ message: `User ${username} not found.` })
  }

  // Check for duplicates
  const duplicate = await _findDuplicate(username)
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username.', duplicate })
  }

  foundUser.username = username
  foundUser.roles = roles
  foundUser.active = active

  if (password) {
    // Hash Password
    foundUser.password = await bcrypt.hash(password, 10) // salt rounds
  }

  foundUser.save()
  res.json({ message: `${foundUser.username} updated.` })
})



// @desc Delete a User
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' })
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID.' })
  }

  const note = await NoteModel.findOne({ user: id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: 'User has associated notes.' })
  }

  const foundUser = await _findUserById(id)

  if (!foundUser) {
    return res.status(400).json({ message: 'User is not found.' })
  }

  const result = await foundUser.deleteOne()
  res.json({message: `Username ${result.username} with ID ${result._id} deleted.`})
})

module.exports = { 
  getAllUsers,
  getSpecificUser,
  createNewUser,
  updateUser,
  deleteUser
}