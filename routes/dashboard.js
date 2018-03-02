
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

//controllers
const dashboardController = require('../controllers/dashboardController')

/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */


router.get("/add-location",  	    dashboardController.addListing 	   )
router.post("/add-location", 	    dashboardController.addListingPost )
router.get("/edit-location-:slug",  dashboardController.edit		   )
router.post("/edit-location-:slug", dashboardController.update		   )
router.get("/my-locations", 		dashboardController.locationsList  )
router.get("/active-stash-:slug", 	dashboardController.activeStashing )
router.post("/change-status",		dashboardController.changeStatus   )

router.get("/update-now", dashboardController.updateNow)

//buttons for check in next

router.get("/", 			dashboardController.index 		       )



module.exports = router
