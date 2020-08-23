const express = require('express')
const router = express.Router()
const Project = require('../models/project')

// Auth middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/")
    }
}

router.use(ensureAuthenticated)

// Protected routes

// GET all projects
router.get('/', async (req, res, next) => {

    Project.find({}, (err, result) => {
        if (err) { console.log(err) }

        params = {
            title: "Projects",
            projects: result
        }
        res.render('projects', params)
    })

})

router.get('/create', (req, res, next) => {

    params = {
        titel: "Create a new project."
    }

    res.render('project')
})


// POST a new project
router.post('/create', (req, res, next) => {

    const { name, summary, description } = req.body
    console.log(description)

    Project.create({
        name: name,
        summary: summary,
        description: description
    }, (err, result) => {
        if (err) { res.send(err) }

        res.redirect('/projects')
    })

})

// GET one project
router.get('/:id', (req, res, next) => {
    const { id } = req.params

    Project.findById(id, (err, result) => {
        if (err) { res.send(err) }

        const { _id, name, summary, description } = result

        params = {
            _id: _id, 
            title: name,
            name: name,
            summary: summary,
            description: description
        }

        res.render('project', params)
    })

})

// POST update an existing project
router.post('/:id', (req, res, next) => {
    const { name, summary, description } = req.body
    console.log(description)


    Project.findByIdAndUpdate(req.params.id, {
        name: name,
        summary: summary,
        description: description
    }, (err, result) => {
        if (err) { res.send(err) }

        res.redirect('back')
    })
})

// POST update an existing project
router.post('/:id/delete', (req, res, next) => {

    Project.findByIdAndDelete(req.params.id,
        (err, result) => {
            if (err) { res.send(err) }

            res.redirect('/projects')
        })
})

module.exports = router