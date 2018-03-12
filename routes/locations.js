const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

//controllers
const locationController = require('../controllers/locationController')
const checkoutController = require('../controllers/checkoutController')
/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */

router.get("/show/:location_slug", locationController.show 		    )
router.post("/availability",   	   locationController.availability  )
router.post("/payment", 		   checkoutController.payment 	    )
router.get("/list",				   locationController.list          )
router.post("/create-comment",	   locationController.createComment )

module.exports = router
