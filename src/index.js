const app = require('./app')

const port = process.env.PORT



//
//without middleware: new request -> run route handler
//
//with middleware:    new equest -> do something -> run router handler
//
app.listen(port, () => {
    console.log('server is up on port ' + port)
})

