const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants'  ) 
const functions   = require('../functions'  )
//Moment.JS with range functions
const Moment      = require('moment')
const MomentRange = require('moment-range');
const moment      = MomentRange.extendMoment(Moment);

const show = (req, res) => {
    //  popup-with-zoom-anim  ::  class for popups
    const location_slug = req.params.location_slug
    if(  req.vertexSession == null || req.vertexSession.user == null ){ 
        req.vertexSession = functions.blankVertexSession() 
    }
    
    const vertexSession = req.vertexSession
    turbo.fetch( collections.locations, { slug: location_slug } )
    .then(data => {
        return data[0]
    })
    .then(location => {
        turbo.fetch( collections.reviews, { location_id: location.id } )
        .then(reviews => {
            const user = vertexSession.user
            const reviewEditPerUser = functions.reviewEditPerUser(reviews, user)
            const description = location.description.split('\n')
            //const img         = JSON.parse( data[0].imgLink )
            const phoneBool   = ( location.phoneNum != ""  )
            const websiteBool = ( location.email    != "" )
            for( let x = 0; x < reviews.length; x++ ){
                reviews[x].starVal = functions.starVal( parseInt(reviews[x].starForm) )
            }
            res.render("locations/show",{ location: location, description: description, 
                phoneBool: phoneBool, websiteBool: websiteBool, vertexSession: vertexSession, 
                reviews: reviewEditPerUser, reviewsQty: reviews.length, showReviewEditForm: vertexSession.user.loggedIn
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

// Searches to see if space is available on the days specified
const availability = (req, res) => {
    
    const body        = req.body
    const startDate   = new Date( body.startDate )
    const endDate     = new Date( body.endDate )
    const location_id = body.location_id
    const bagsNum     = parseInt( body.qtyBags )
    

    // 4 different scenarios
    // Either person will stash for one day
    // Stash multiple days within the same month
    // stash between years ie: dec 30 - jan 3
    // these four must be dealt with to be able 
    // to do all edge cases and in one algorithm, full of thens

    const range = moment.range(startDate, endDate)
    const arrayOfDates = Array.from(range.by('days'))
    
    let dates = []
    //what if person does something crazy like reserve for 3 months, this is to avoid a
    //potential edge case
    if( startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() != endDate.getMonth() ){
        const startMonth = startDate.getMonth() + 1
        const endMonth   = endDate.getMonth() + 1
        for( let x = startMonth; x <= endMonth; x++ ){
            dates.push({ year: startDate.getFullYear(), month: x })
        }
    }
    else if( startDate.getFullYear() != endDate.getFullYear() ){
        dates.push({ year: startDate.getFullYear(), month: startDate.getMonth() + 1 })
        dates.push({ year: endDate.getFullYear(),   month: endDate.getMonth()   + 1 })
    }else{
        dates.push({ year: startDate.getFullYear(), month: startDate.getMonth() + 1 })
    }
    
    let capacity = []

    for( let x = 0; x < dates.length; x++ ){
        turbo.fetch( collections.capacities, { location_id: location_id } )//year: dates[x].year, month: dates[x].month
        .then(data => {
            const filtered = data.filter(d => d.year == dates[x].year && d.month == dates[x].month )
            capacity.push(filtered[0])
            return
        })
        .then( () => {
            // here a check will be done to see if space is available for the bags
            // again remember the scenarios. 
            // 4 different scenarios
            // Either person will stash for one day
            // Stash multiple days within the same month
            // stash between years ie: dec 30 - jan 3
            // these four must be dealt with to be able 
            // to do all edge cases and in one algorithm, full of thens
            let resJson = null
            const sumTotal = functions.calcPrice(bagsNum, body.startDate, body.endDate)// static number
            
            if( x == dates.length - 1 ){
                
                // get sequence of days using a filter. then check if space available using a map
                if( startDate.getTime() == endDate.getTime() ){
                    //within one day
                    // gets the info for that one day
                    const day = capacity[0].days[ startDate.getDate() - 1]
                    if( day.capacity - day.reserved >= bagsNum ){
                        resJson =  {
                            space: true,
                            msg: "Space available!",
                            capacity: JSON.stringify( capacity )

                        }
                    }else{
                        resJson = {
                            space: false,
                            msg: "There's no space available"
                        }
                    }
                    
                }else if(startDate.getMonth() == endDate.getMonth() && startDate.getFullYear() == endDate.getFullYear()){
                    //within one month, but different days.. ie:.. jan 23 - jan 25
                    // will get the range of days that correspond to the start and end dates
                    const days  = capacity[0].days.filter( d => d.day >= startDate.getDate() && d.day <= endDate.getDate() )
                    // maps over the range of days, and if space is available it return a 1 else it returns a 0
                    // this is so that in the end after adding up 1's and 0's in the space array
                    // if we get the length of the days(range of dates) array there is space over these days for the 
                    // bags, else no space is available
                    const space = days.map( d => {
                        if( d.capacity - d.reserved >= bagsNum ){
                            return 1
                        }else{
                            return 0
                        }
                    })
                    const addup = space.reduce((a, b) => a + b, 0)
                    if( addup == days.length ){
                        
                        resJson = {
                            space: true,
                            msg: "Space available!",
                            capacity: JSON.stringify( capacity ),

                        }
                    }else{
                        resJson = {
                            space: false,
                            msg: "There's no space available"
                        }
                    }
                }else if( startDate.getMonth() != endDate.getMonth() && startDate.getFullYear() == endDate.getFullYear() ){
                    // different months same year scenario... ie: jan: 29 - feb: 4
                    // for now im going to treat this as if people dont stash over 3 or more months. that would be weird
                    // solution might be to check if there are any inbetween months and move on from there
                    // should be easy to figure out for airbnb clone
                    const startDays = capacity[0].days.filter( d => d.day >= startDate.getDate() && d.day <= new Date(startDate.getFullYear(),startDate.getMonth()+1, 0) )
                    const endDays   = capacity[1].days.filter( d => d.day >= 1 && d.day <= endDate.getDate() )
                    
                    const startSpace = startDays.map( d => {
                        if( d.capacity - d.reserved >= bagsNum ){
                            return 1
                        }else{
                            return 0
                        }
                    })
                    const endSpace = endDays.map( d => {
                        if( d.capacity - d.reserved >= bagsNum ){
                            return 1
                        }else{
                            return 0
                        }
                    })

                    const space = [...startSpace, ...endSpace]
                    const addup = space.reduce((a, b) => a + b, 0)

                    if( addup == ( startDays.length + endDays.length ) ){
                        resJson = {
                            space: true,
                            msg: "Space available!",
                            capacity: JSON.stringify( capacity )

                        }
                    }else{
                        resJson = {
                            space: false,
                            msg: "There's no space available"
                        }
                    }
                }else if( startDate.getFullYear() != endDate.getFullYear() ){
                    // different year scenario. basically dec 2017 - jan 2018
                    // fix here is identical to the one above
                    // including fix incase someone wants to reserve something like dec 30 - feb 3
                    // this will only be necessary in future implementations of the this algorithm 
                    const startDays = capacity[0].days.filter( d => d.day >= startDate.getDate() && d.day <= new Date(startDate.getFullYear(),startDate.getMonth()+1, 0) )
                    const endDays   = capacity[1].days.filter( d => d.day >= 1 && d.day <= endDate.getDate() )
                    
                    const startSpace = startDays.map( d => {
                        if( d.capacity - d.reserved >= bagsNum ){
                            return 1
                        }else{
                            return 0
                        }
                    })
                    const endSpace = endDays.map( d => {
                        if( d.capacity - d.reserved >= bagsNum ){
                            return 1
                        }else{
                            return 0
                        }
                    })

                    const space = [...startSpace, ...endSpace]
                    const addup = space.reduce((a, b) => a + b, 0)

                    if( addup == ( startDays.length + endDays.length ) ){
                        resJson = {
                            space: true,
                            msg: "Space available!",
                            capacity: JSON.stringify( capacity )

                        }
                    }else{
                        resJson = {
                            space: false,
                            msg: "There's no space available"
                        }
                    }
                }

                if(resJson.space){
                    resJson.sumTotal = sumTotal
                }

                

                res.status(200).json(resJson)
                return
            }
        })
        .catch(err => {
            err.message = err.message == "" ? "Please try again there was an error. No Charge was Created" : err.message
            res.status(500).json({
                message: err.message
            })
            
            return
        })
    }
}

const list = (req, res) => {
    let page
    turbo.fetch( collections.locations, null )
    .then(data => {
        
        if( typeof req.query.page == "undefined" || parseInt( req.query.page ) == 1 ){
            page = 0
        }else{
            page = parseInt( req.query.page ) - 1
        }
        if(  req.vertexSession == null || req.vertexSession.user == null ){ 
            req.vertexSession = functions.blankVertexSession() 
        }
        const vertexSession = req.vertexSession
        
        const cities   = constants.cities
        const listCats = constants.listCats
       
        let locations = null
        const city    = req.query.city
        const listCat = req.query.listCat
        
        if( typeof city != "undefined" && ( listCat == "All" || typeof listCat == "undefined" ) ){
            locations = data.filter( d => d.city == city )
        }else if( typeof city != "undefined" && listCat != "All" ){
            locations = data.filter( d => d.city == city && d.category == listCat )
        }else{
            locations = data
        }
        
        const pageData  = functions.paginationArrays(locations, 8)
        const pgLinks   = functions.pgLinks(pageData.length, page)
        
        res.render('locations/list', { locations: pageData[page], vertexSession,
            cities: cities, listCats: listCats, pgLinks: pgLinks, city:city, listCat: listCat })
        return
    }).catch(err => {
        res.status(500).json({
            err: err.message
        })
        return
    })
}

const createComment = (req, res) => {
    const body = req.body
    const user = req.vertexSession.user
    const review = {
        location_id: body.location_id, review: body.review, email: body.email, name: body.name,
        starForm: parseInt( body.star ), user_id: user.id
    }
    const starVal = functions.starVal( parseInt(body.star) )
    const starScore = parseInt( body.oldStar ) + parseInt( starVal )

    //getting the date
    const month = constants.months[ new Date().getMonth() + 1 ].month

    review.day = `${month}, ${new Date().getDate()} ${new Date().getFullYear()}`
    //update starscore for location then save comment
    
    turbo.updateEntity( collections.locations, body.location_id, { starScore } )
    .then(data => {
        return
    })
    .then( () => {
        turbo.create( collections.reviews, review )
        .then(newReview => {
            res.redirect('back')
            return
        })
    })
    .catch(err => {
        res.status(200).json({
            err: err.message
        })
        return
    })
}

module.exports = {
    show:          show,
    availability:  availability,
    list:          list,
    createComment: createComment
}