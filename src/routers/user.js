const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()

router.get('/test', (req, res) => {
    res.send('From a new file')
})

//run the auth middleware first, middleware function is the 2nd argument
router.get('/users/me', auth, async (req, res) => {
    //send back user data after auth
    res.send(req.user)
    // try{
    //     const user = await User.find({})
    //     res.send(user)
    // }catch(err){
    //     res.status(500).send({error:err})
    // }
})

router.get('/users/:id', async (req, res) => {
    // User.findById(req.params.id).then((user)=>{
    //     if(!user){
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })

    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

//update user by ID
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const inValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!inValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()
        res.send(user)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        //const user = await User.findByIdAndDelete(req.user._id)
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        return res.send(req.user)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

})

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        if (!user) {
            return res.status(401).send('Invalid user')
        }
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send(req.user)
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})




const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx|pdf|jpg)$/)) {
            return cb(new Error('Please upload a doc|docx|pdf file'))
        }
        // cb(new Error('File must be a PDF'))
        cb(undefined, true)
        // cb(undefined, false)
    }
})

//second argument is middleware function
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//delete user avatarf
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

router.get('/user/:id/avatar', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error("Invalid request")
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})
module.exports = router

