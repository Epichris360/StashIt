const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants') 
const functions   = require('../functions')

const index = (req, res) => {
    const user = req.vertexSession.user
    functions.isStasher(user, res)
    const vertexSession = req.vertexSession
    let page
    if( typeof req.query.page == "undefined" || req.query.page == 1 ){
        page = 0
    }else{
        page = req.query.page - 1
    }
    turbo.fetch( collections.stashed, { customer_id: user.id, activeStr:"true" } )
    .then(data => { 
        const pageData = functions.paginationArrays(data,6)
        const pgLinks  = functions.pgLinks(pageData.length, page)
        res.render('dashPages/index', { stashed: pageDate[page], pgLink: pgLink, vertexSession })
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