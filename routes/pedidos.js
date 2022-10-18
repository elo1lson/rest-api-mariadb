const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool

router.get('/', (req, res, next) => {

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      `SELECT pedidos.id_pedido,
              pedidos.quantidade,
              produtos.id_produto,
              produtos.nome,
              produtos.preco
        FROM  pedidos
  INNER JOIN produtos
          ON produtos.id_produto = pedidos.id_produto;
      `,
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          pedidos: result.map(pedido => {
            return {
              id_pedido: pedido.id_pedido,
              quantidade: pedido.quantidade,
              produto: {
                id_produto: pedido.id_produto,
                nome: pedido.nome,
                preco: pedido.preco

              },
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
router.get('/:id', (req, res) => {
  console.log(req.params);
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      'SELECT * FROM pedidos WHERE id_pedido = ?;',
      [req.params.id],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error })
        }
        if (result.length == 0) {
          console.log(result);
          return res.status(404).send({
            mensagem: 'Não foi possivel encontrar esse pedido'
          })

        }
        const response = {
          pedido: {
            id_produto: result[0].id_pedido,
            id_produto: result[0].id_produto,
            quantidade: result[0].quantidade,
            request: {
              tipo: 'DELETE',
              descricao: '',
              url: req.protocol + '://' + req.get('host') + req.originalUrl
            }

          }
        }
        return res.status(201).send({ response: result })
      })
  })
})
router.post('/', (req, res, next) => {

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query('SELECT * FROM produtos WHERE id_produto = ?',
      [req.body.id_produto],
      (error, result, field) => {
        if (error) return res.status(500).send({ error: error })

        if (result.length == 0) {

          return res.status(404).send({
            mensagem: 'Produto não encontrado'
           
          }) 

        }
      }
    )

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
            id_produto: req.body.id_produto,
            quantidade: req.body.quantidade,
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
router.delete('/:id', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      `DELETE FROM pedidos WHERE id_produto = ?`,
      [req.params.id],
      (error, result, field) => {
        console.log(error);
        conn.release()
        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          mensagem: 'Produto removido com sucesso',
          request: {
            tipo: 'POST',
            descricao: '',
            url: req.protocol + '://' + req.get('host') + 'pedidos',
            body: {
              id_pedido: 'Number',
              quantidade: 'Number'
            }
          }
        }
        return res.status(202).send({ response })
      }
    )
  })

})
module.exports = router