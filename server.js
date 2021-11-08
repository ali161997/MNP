const { urlencoded } = require('express');
const express = require('express')
const db = require('./models')
const app = express()
const router = require('./routes/route')

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(router);


db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`listening on: http://localohost:${PORT}`)
    })
})