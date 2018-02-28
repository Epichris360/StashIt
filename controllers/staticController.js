const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants')

const root = (req, res) => {
    turbo.fetch( collections.locations, null )
    .then(data => {
        const austin  = data.filter(d => d.city == constants.cities[3].name ).length
        const sanFran = data.filter(d => d.city == constants.cities[1].name ).length
        const nyc     = data.filter(d => d.city == constants.cities[0].name ).length
        const La      = data.filter(d => d.city == constants.cities[2].name ).length
        res.render('index', { austin, sanFran, nyc, La })
        return
    })
    .catch(err => {
        res.redirect('/')
        return
    })
    turbo.logout()    
}

module.exports = {
    root: root
}