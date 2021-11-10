const db = require('./models')
const app = require('./app')

const PORT = process.env.PORT //from dev.env file

db.sequelize.sync().then((data) => {
    console.log(data.config)
    app.listen(PORT, () => {
        console.log(`listening on: http://localohost:${PORT}`)
    })
})