const express = require("express")
const morgan = require('morgan')
const app = express()

const routaProdutos = require("./routes/produtos")

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(morgan('dev'))
app.use('/produtos', routaProdutos)

app.use((req, res, next) => {
  let erro = new Error('Not found')
  erro.status = 404
  next(erro)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  return res.send({
    erro:{
      message: error.message
    }
  })
})

module.exports = app 