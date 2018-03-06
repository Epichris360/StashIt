// for consumer dashboard routes
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

//controllers
const dashController = require('../controllers/dashController')

// Dash is for customer pages ie: customers paying for stashing bags

/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */

router.get('/', dashController.index )

module.exports = router
