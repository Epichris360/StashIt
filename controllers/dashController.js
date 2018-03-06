const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants') 
const functions   = require('../functions')

const index = (req, res) => {
    const user = req.vertexSession.user
    functions.isStasher(user, res)
    turbo.fetch( collections.stashed, { customer_id: user.id, activeStr:"true" } )
    .then(data => {
        res.render('dashPages/index', { stashed: data })
        return
    })
    .catch(err => {
       res.status(500).json({
           err: err.message
       })
       return
    })
}

module.exports = {
    index: index
}