const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants')
const functions   = require('../functions')

const root = (req, res) => {
    turbo.fetch( collections.locations, null )
    .then(data => {
        if(  req.vertexSession == null || req.vertexSession.user == null ){ 
            req.vertexSession = functions.blankVertexSession() 
        }
        const austin  = data.filter(d => d.city == constants.cities[3].name ).length
        const sanFran = data.filter(d => d.city == constants.cities[1].name ).length
        const nyc     = data.filter(d => d.city == constants.cities[0].name ).length
        const La      = data.filter(d => d.city == constants.cities[2].name ).length
        const vertexSession = req.vertexSession
        res.render('index', { austin, sanFran, nyc, La, vertexSession })
        return
    })
    .catch(err => {
        res.redirect('/')
        return
    }) 
}


module.exports = {
    root: root
}