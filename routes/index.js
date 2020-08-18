var express = require('express');
var router = express.Router();
var session = require('express-session')
var flash = require('connect-flash')


/* GET home page. */
router.get('/', (req, res, next) => {

  params = {
    title: "Admin Login"
  }

  res.render('index', params)
})

// Auth middleware
const ensureAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()){
    next()
  } else {
    res.redirect("/")
  }
}

// Protected routes

router.get('/secret', ensureAuthenticated, (req, res, next) =>{
  res.send("Top Secret.")
})



module.exports = router;
