const mongoose = require('mongoose')

module.exports = mongoose.model('Project', {
    name: String,
    summary: String,
    githubLink: String,
    link: String,
    description: String
})