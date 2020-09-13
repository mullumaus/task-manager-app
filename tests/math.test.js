const { add } = require('../src/math')
const math = require('../src/math')

test('Calculate total with tip', () => {
    const total = math.calculateTip(10, 0.3)
    expect(total).toBe(13)
})


test('Calculate total with default tip', () => {
    const total = math.calculateTip(10)
    expect(total).toBe(13)
})

test('Should convert 32F to 0 C', () => {
    const celsius = math.fahrenheitToCelsius(32)
    expect(celsius).toBe(0)
})

test('Should convert 0 C to 32F', () => {
    const fahren = math.celsiusToFahrenheit(0)
    expect(fahren).toBe(32)
})


test('Should add two numbers', (done) => {
    add(2, 2).then((sum) => {
        expect(sum).toBe(4)
        done()
    })
})

test('Should add two number async/await', async () => {
    const sum = await add(2, 2)
    expect(sum).toBe(4)
})
