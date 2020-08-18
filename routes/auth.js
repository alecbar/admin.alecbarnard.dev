const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get('/signin', (req, res, next) => {
    passport.authenticate('azuread-openidconnect',
        {
            response: res,
            prompt: 'login',
            failureRedirect: '/',
            failureFlash: true,
            successRedirect: '/'
        }
    )(req, res, next)
})

router.post('/callback', (req, res, next) => {
    passport.authenticate('azuread-openidconnect',
        {
            response: res,
            failureRedirect: '/',
            failureFlash: true,
            successRedirect: '/'
        }
    )(req, res, next);
})

router.get('/signout', (req, res) => {
    req.session.destroy(err => {
        req.logout()
        res.redirect('/')
    })
})

module.exports = router