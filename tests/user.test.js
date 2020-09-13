const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../src/models/user')


const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'guolihui@gmail.com',
    password: '123456789',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}


//before each testcase in this test suite
beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

//beforeEach
//beforeAll
//afterEach
//beforeAll

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'James Wang',
        email: 'lihuiguo@gmail.com',
        password: '123456789'
    }).expect(201)

    // Assert that database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'James Wang',
            email: 'lihuiguo@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(response.body.user.name).toBe('James Wang')
    //password should not be in plain text
    expect(user.password).not.toBe('123456789')
})

test('Shoud login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[0].token)
})

test('Should not login non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: '12345602789'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})


test('Should delete account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})


