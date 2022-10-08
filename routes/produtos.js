const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool

router.get('/', (req, res) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status.send({ error: error })
    }
    conn.query(
      'SELECT * FROM produtos',
      (error, result, fields) => {
        if (error) {
          return res.status.send({ error: error })
        }
        return res.status(200).send({ response: result })
      })
  })
})

router.post('/', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status.send({ error: error })
    }
    conn.query(
      'INSERT INTO produtos (nome, preco) VALUES (?,?)',
      [req.body.nome, req.body.preco],
      (error, result, field) => {
        conn.release()

        if (error) {
          return res.status.send({ error: error })
        }

        res.status(201).send({
          message: 'Produto inserido com sucesso',
          id_produto: result.insertId
        })
      }
    )
  })

})

module.exports = router