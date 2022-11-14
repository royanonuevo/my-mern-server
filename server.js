require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
// const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
// const credentials = require('./middleware/credentials')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConnection')

console.log('Node Environemnt: ', process.env.NODE_ENV)

// Connect to Mongo Database
connectDB()

// Custom Middleware
app.use(logger)

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(credentials)

// 3rd Party Middleware: Cross Origin Resource Sharing
app.use(cors(corsOptions))

// Built-in Middleware to handle urlencoded form data
// app.use(express.urlencoded({ extended: false }))

// Built-in Middleware
app.use(express.json())
app.use('/', express.static(path.join(__dirname, 'public'))) // Serve Static Files

// 3rd Party Middleware
app.use(cookieParser())




// Routes
app.use('/', require('./routes/root'))
app.use('/users', require('./routes/users'))
app.use('/notes', require('./routes/notes'))
// app.use('/register', require('./routes/register'))
// app.use('/auth', require('./routes/auth'))
// app.use('/refresh', require('./routes/refresh'))
// app.use('/logout', require('./routes/logout'))

// app.use(verifyJWT)
// app.use('/employees', require('./routes/api/employees'))

// Handle 404
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// Custom Middleware
app.use(errorHandler)


mongoose.connection.once('open', () => {
    console.log('Connected to Mongo DB.')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongo-error-logs.log')
})