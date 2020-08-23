const mongoose = require('mongoose')

module.exports = mongoose.model('Project', {
    name: String,
    summary: String,
    description: String
})