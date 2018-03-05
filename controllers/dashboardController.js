const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants') 
const functions   = require('../functions')
const Moment      = require('moment')
const MomentRange = require('moment-range');
const moment      = MomentRange.extendMoment(Moment);

const addListing   = (req, res) => {
    const user = req.vertexSession.user
    functions.isStasher(user, res)
    const listCats = constants.listCats
    const cities   = constants.cities
    res.render('dashBoardPages/AddLocation',{ listCats: listCats, cities: cities })
}

const addListingPost = (req, res) => {
    const body = req.body
    const user = req.vertexSession.user
    
    functions.isStasher(user, res)

    const name        = body.listingTitle
    const slug        = name.toLowerCase().split(" ").join("+") + "+" + functions.randomString(4)
    const category    = body.category
    const city        = body.city
    const address     = body.address
    const zipcode     = body.zipcode
    const description = body.description
    const phoneNum    = body.phoneNum
    const website     = body.website
    const email       = body.email
    const capacity    = parseInt(body.capacity )
    const imgLink     = body.imgLink
    const days        = body["day[]"]
    const openTime    = body["openTime[]"]
    const closeTime   = body["closeTime[]"]

    const times      = constants.times
    const indexTime  = times.map( t => t.name  )

    let schedule = []
    const length = days.length
    

    for( let x = 0; x < length; x++ ){
        // creates a new object within the schedule array
        schedule[x] = { name: days[x], openTime: openTime[x], closeTime: closeTime[x] }
        // gets the index of the time that the location opens
        // and add that number to the array, this is to make calculations more easy later on
        let index = indexTime.indexOf(schedule[x].openTime)
        schedule[x].openNum = times[index].time
        // get index of the time that the location closes
        // and add that number to the array, this is to make calculations more easy later on
        index = indexTime.indexOf( schedule[x].closeTime )
        schedule[x].closeNum = times[index].time
    }

    const location = {
        name: name, category: category, city: city, address: address, zipcode: zipcode, 
        description: description, phoneNum: phoneNum, website: website, email: email,
        schedule: schedule, imgLink: imgLink, owner_id: user.id, capacity: capacity, slug: slug
    }

    turbo.create( collections.locations, location )
    .then(data => {
        return data
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
		return location
    })
    .then(location => {
        res.redirect("/location/show/"+location.slug)
        return
    })
    .catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}

const index = (req, res) => {
    const user = req.vertexSession.user
    functions.isStasher(user, res)
    res.render('dashBoardPages/index')
    return
}

const edit = (req, res) => {
    const slug = req.params.slug
    turbo.fetch( collections.locations, { slug })
    .then(data => {
        let times     = []
        const schedule = data[0].schedule
        for( let x = 0; x < schedule.length; x++ ){
            times.push( functions.scheduleSelected( schedule[x] ) )
        }
        
        const listCats = functions.selected( data[0], constants.listCats,"category" )
        const cities   = functions.selected( data[0], constants.cities, "city" )

        res.render('dashBoardPages/EditLocation',
            { location: data[0], listCats: listCats, cities: cities, times: times })
        return
    })
    .catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}

const update = (req, res) => {
    const body = req.body
    const user = req.vertexSession.user

    functions.isStasher(user, res)

    const name        = body.listingTitle
    const slug        = req.params.slug
    const category    = body.category
    const city        = body.city
    const address     = body.address
    const zipcode     = body.zipcode
    const description = body.description
    const phoneNum    = body.phoneNum
    const website     = body.website
    const email       = body.email
    const capacity    = parseInt(body.capacity )
    const imgLink     = body.imgLink
    const days        = body["day[]"]
    const openTime    = body["openTime[]"]
    const closeTime   = body["closeTime[]"]

    const times      = constants.times
    const indexTime  = times.map( t => t.name  )

    let schedule = []
    const length = days.length
    

    for( let x = 0; x < length; x++ ){
        // creates a new object within the schedule array
        schedule[x] = { name: days[x], openTime: openTime[x], closeTime: closeTime[x] }
        // gets the index of the time that the location opens
        // and add that number to the array, this is to make calculations more easy later on
        let index = indexTime.indexOf(schedule[x].openTime)
        schedule[x].openNum = times[index].time
        // get index of the time that the location closes
        // and add that number to the array, this is to make calculations more easy later on
        index = indexTime.indexOf( schedule[x].closeTime )
        schedule[x].closeNum = times[index].time
    }

    const updatedLocation = {
        name: name, category: category, city: city, address: address, zipcode: zipcode, 
        description: description, phoneNum: phoneNum, website: website, email: email,
        schedule: schedule, imgLink: imgLink
    }

    turbo.fetch( collections.locations, { slug: slug } )
    .then(data => {
        return data
    })
    .then(location => {
        turbo.updateEntity( collections.locations, location.id, updatedLocation )
        .then(data => {
            res.redirect("/dashboard/my-locations")
        })
        return
    })
    .catch(err => {
        res.status(200).json({
            err: err.message
        })
        return
    })
}

const locationsList = (req, res) => {
    const user = req.vertexSession.user
    functions.isStasher(user, res)
    turbo.fetch( collections.locations, { owner_id: user.id } )
    .then(data => {
        res.render('dashBoardPages/myList',{ locations: data })
        return
    })
    .catch(err => {
        res.status(200).json({
            err: err.message
        })
        return
    })
}

const activeStashing = (req, res) => {
    const slug = req.params.slug
    const user = req.vertexSession.user

    // Pagination!
    let page
    if( typeof req.query.page == "undefined" || req.query.page == 1 ){
        page = 0
    }else{
        page = req.query.page - 1
    }

    functions.isAuth( user, res )
    
    turbo.fetch( collections.locations, { slug } )
    .then(data => {
        if( data[0].owner_id == user.id ){
            return data[0]
        }else{
            res.status(500).json({
                err: "There was an error. Please try again Later"
            })
            return
        }
    })
    .then( location => {
        turbo.fetch( collections.stashed, { location_id: location.id } )
        .then(data => {
            //add status attr to the stashed objects on creation
            //query which 
            for( let x = 0; x < data.length; x++ ){
                data[x].days = ( new Date(data[x].endDate) - new Date(data[x].startDate) ) / (1000 * 60 * 60 * 24) 
            }
            // get btn to change statuses tommorrow, add pagination and search, old ones
            // that should do it for the dashboard. Maybe delete the main dashboard page

            // Finish adding ratings system and comments to locations

            // small dashboard for users
            // Finish by Wednesday!!!!

            //Next project do something map related
            // --> Simple meetup clone with google maps markers to show where the meetups are
            // --> Simple tourism app showing where shops etc are in a city like kiwi.com
            // --> simple slack clone
            // that makes 4.. Practice using mongoose and whatever other tech is hevily requested
            // apply to every remote javascript role i can find
            // Learn either react native or flutter
            
            
            const pageData = functions.paginationArrays(data,6)
            const pgLinks  = functions.pgLinks(pageData.length, page)
            res.render('dashBoardPages/stashListings',{ stashed: pageData[page], pgLinks: pgLinks, slug: slug })
            return  
        })
    })
    .catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}

const changeStatus = (req, res) => {
    // changes the status of a stash. ex: someone brings in the bags and they are set to stashed
    const id       = req.body.checkInID
    const statusID = req.body.statusId
    
    turbo.fetchOne( collections.stashed, id )
    .then(data => {
        data.status.id = 1
        if( statusID == 0 && data.status.id == 0 ){ //check-in
            data.status = constants.stashStatus[1]
        }else if( statusID == 1 && data.status.id == 1 ){
            data.status = constants.stashStatus[2]
        }
        turbo.updateEntity( collections.stashed, data.id, data )
        .then(update => {
            res.status(200).json({
                update : data
            })
            return
        })
    })
    .catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}

const searchTicket = (req, res) => {
    const ticket = req.params.tick_num
    const state  = req.params.state
    turbo.fetch( collections.stashed, { ticket } )
    .then(data => {

    })
    .catch(err => {
        //replace these with backs and error msgs
        res.status(200).json({
            err: err.message
        })
    })
}

const updateNow = (req, res) => {
    turbo.fetch( collections.stashed, null )
    .then(data => {
        return data[1]
    })
    .then( location => {
        location.status = constants.stashStatus[0]
        turbo.updateEntity( collections.stashed, location.id, location )
        .then(data => {
            res.status(200).json({
                data: data
            })
            return
        })
    })
    .catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}
 
module.exports = {
    addListing:     addListing, 
    addListingPost: addListingPost,
    index:          index,
    edit:           edit,
    update:         update,
    locationsList:  locationsList,
    activeStashing: activeStashing,
    changeStatus:   changeStatus,
    updateNow:      updateNow
}