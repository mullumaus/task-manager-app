const mongoose = require('mongoose')

const connectionURl = process.env.MONGODB_URL


mongoose.connect(connectionURl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,

})

