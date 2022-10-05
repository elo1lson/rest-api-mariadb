const express = require('express')
const router = express.Router()

router.get('/', (req, res)=>{
  res.status(200).json('66')
})

module.exports = router