const turbo  	  = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex      = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router 	  = vertex.router()
const collections = require('../collections')
const functions   = require('../functions')
const constants   = require('../constants')

//controllers
const staticController = require('../controllers/staticController')

/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */
router.get('/', staticController.root )


// experiments

router.get("/reqStatus", function(req, res){
	res.status(200).json({
		vertexSession: req.vertexSession
	})
	return
})

/*
router.get( "/createRecord", (req, res) => {
	turbo.fetch( collections.locations, null )
	.then(data => {
		return data[0]
	})
	.then(location => {
		const currentYear = new Date().getFullYear()
		const years 	  = [currentYear]//, currentYear+1, currentYear+2
		const months      = constants.months

		let capacities = []

		for( let x = 0; x < years.length; x++ ){
			
			for( let y = 0; y < months.length; y++ ){
				const numDays = new Date(years[x], months[y].num, 0).getDate();
				let days = []
				for( let w = 1; w <= numDays; w++ ){
					days.push({ day:w, capacity: 50, reserved:0 })
				}

				const capacity = { year: years[x], month: months[y].num, location_id: location.id , days:days }
				capacities.push(capacity)
			}
		}

		const capNum = capacities.length

		for( let x = 0; x < capNum; x++ ){
			turbo.create( collections.capacities, capacities[x] )
			.then(data => {
				return
			})
			.catch(err => {
				return
			})
		}
		return
	})
	.then(() => {
		res.status(200).json({
			works: "true"
		})
		return
	})
	.catch(err => {
		res.status(500).json({
			errMsg: err.message
		})
		return
	})
})*/

router.get("/get-data", (req, res) => {
	turbo.fetch( collections.locations, null )
	.then(data => {
		return data[0]
	})
	.then( location => {
		turbo.fetch( collections.capacities, { location_id: location.id } )
		.then(capacities => {
			res.status(200).json({
				location: location
			})
			return
		})
		return
	})
	.catch(err => {
		res.status(500).json({
			errMsg: err.message
		})
		return
	})
})




module.exports = router