const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

  params = {
    title: "Admin Login"
  }

  res.render('index', params)
})

module.exports = router;
