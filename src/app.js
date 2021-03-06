const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()


// const multer = require('multer')
// const upload = multer({
//     dest: 'images'
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// })


//pass incoming json object
app.use(express.json())
/*app.use([path,] callback [, callback...])
 Mounts the specified middleware function or 
 functions at the specified path: the middleware function is executed when the base of the
 requested path matches path. */
app.use(userRouter)
app.use(taskRouter)

//
//without middleware: new request -> run route handler
//
//with middleware:    new equest -> do something -> run router handler
//

module.exports = app
