const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool

router.get('/', (req, res, next) => {

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      'SELECT * FROM pedidos',
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          quantidade: result.length,
          pedidos: result.map(pedido => {
            return {
              id_produto: pedido.id_produto,
              id_pedido: pedido.id_pedido,
              quantidade: pedido.quantidade,
              request: {
                tipo: 'GET',
                descricao: '',
                url: req.protocol + '://' + req.get('host') + req.originalUrl + pedido.id_pedido
              }

            }
          })
        }
        return res.status(202).send({ response })
      })
  })
})

router.post('/', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      'INSERT INTO pedidos (id_produto, quantidade) VALUES (?,?)',
      [req.body.id_produto, req.body.quantidade],
      (error, result, field) => {
        conn.release()

        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          mensagem: 'Produto inserido com sucesso',
          produtoCriado: {
            id_pedido: result.id_pedido,
            id_produto: req.body.id,
            quantidade: req.body.quantidade,
            nome: result.nome,
            preco: result.preco,
            request: {
              tipo: 'POST',
              descricao: '',
              url: req.protocol + '://' + req.get('host') + req.originalUrl
            }

          }
        }
        res.status(201).send({ response })
      }
    )
  })

})
module.exports = router