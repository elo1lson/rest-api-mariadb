const express = require("express")
const morgan = require('morgan')
const app = express()

const routaProdutos = require("./routes/produtos")
const rotaPedidos = require("./routes/pedidos")

app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
/*
app.use((req, res, next) => {
  res.header('Access-Control-Origin', '*')
  res.header(
    'Access-Control-Allow-Header',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).send({})

  }
  next()
})
*/
app.use('/produtos', routaProdutos)
app.use('/pedidos', rotaPedidos)

app.use((req, res, next) => {
  let erro = new Error('Not found')
  erro.status = 404
  next(erro)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  return res.send({
    erro: {
      message: error.message
    }
  })
})

module.exports = app 