const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')

  },
  filename: function (req, file, cb) {

    cb(null, new Date().toISOString() + file.originalname)

  }
})

const filter = (req, file, cb) => {
  if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: filter
})

router.get('/', (req, res) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      'SELECT * FROM produtos',
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          quantidade: result.length,
          produtos: result.map(prod => {
            return {
              id_produto: prod.id_produto,
              nome: prod.nome,
              preco: prod.preco,
              imagem_produto: prod.imagem_produto,
              request: {
                tipo: 'GET',
                descricao: '',
                url: req.protocol + '://' + req.get('host') + req.originalUrl
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
      'SELECT * FROM produtos WHERE id_produto = ?;',
      [req.params.id],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error })
        }
        if (result.length == 0) {
          return res.status(404).send({
            mensagem: 'N??o foi possivel encontrar esse produto'
          })

        }
        let image = result[0].imagem_produto || ''
        const response = {
          produto: {
            id_produto: result.id_produto,
            nome: result[0].nome,
            preco: result[0].preco,
            imagem_produto: req.protocol + '://' + req.get('host') + image,

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

router.post('/', upload.single('produto_imagem'), (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?,?,?)',
      [
        req.body.nome,
        req.body.preco,
        req.file.path
      ],
      (error, result, field) => {
        conn.release()

        if (error) {
          return res.status(500).send({ error: error })
        }
        const response = {
          mensagem: 'Produto inserido com sucesso',
          produtoCriado: {
            id_produto: result.id_produto,
            nome: result.nome,
            preco: result.preco,
            imagem_produto: req.protocol + '://' + req.get('host') + req.file.path,
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

router.patch('/', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      `UPDATE produtos
          SET nome = ?,
              preco = ?
        WHERE id_produto = ?`,
      [
        req.body.nome,
        req.body.preco,
        req.body.id
      ],
      (error, result, field) => {
        console.log(error);
        conn.release()

        if (error) {
          return res.status(500).send({ error: error })
        }

        const response = {
          mensagem: 'Produto alterado com sucesso',
          produtoCriado: {
            id_produto: result.id_produto,
            nome: result.nome,
            preco: result.preco,
            imagem_produto: result.imagem_produto || '',
            request: {
              tipo: 'POST',
              descricao: '',
              url: req.protocol + '://' + req.get('host') + req.originalUrl + req.body.id
            }
          }
        }
        res.status(201).send({ response })
      }
    )
  })

})

router.delete('/', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error })
    }
    conn.query(
      `DELETE FROM produtos WHERE id_produto = ?`,
      [req.body.id],
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
            descricao: ''
          }
        }
        return res.status(202).send({ response })
      }
    )
  })

})
module.exports = router