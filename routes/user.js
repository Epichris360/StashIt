const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

//controllers
const userController = require('../controllers/userController')

/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */
router.post('/signup', userController.signup )
router.post('/signin', userController.signin )
router.get("/signout", userController.signout )



module.exports = router
