const db = require('./models')
const app = require('./app')


const PORT = process.env.PORT
console.log(PORT)
db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`listening on: http://localohost:${PORT}`)
    })
})