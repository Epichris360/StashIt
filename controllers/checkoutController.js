const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants   = require('../constants') 
const functions   = require('../functions')
const stripe      = require("stripe")("sk_test_PriIYXaLvWm5L0uTm8fEIr4i")

const payment         = (req, res) => {
    const body        = req.body
    const startDate   = new Date( body.startDate  ) 
    const endDate     = new Date( body.endDate    )
    const qtyBags     = parseInt( body.qtyBags    )
    let   capacity    = JSON.parse( body.capacity )
    const location_id = body.location_id
    const sumTotal    = functions.calcPrice(qtyBags, body.startDate, body.endDate )
    const token       = req.body.stripeToken
    const user        = req.vertexSession.user
    // update capacity for the dates in the range
    // will have to copy code from the search function
    // create a record for the reservation that includes location_id, active: true, customer_id etc
    // this is for query reasons 

    
    let stashed = { location_id: location_id, customer_id: user.id, sumTotal: sumTotal, 
        qtyBags: qtyBags, startDate: body.startDate, endDate: body.endDate, active: true,  
        activeStr: "true"
    }

    if( startDate.getTime() == endDate.getTime() ){
        //same day
        const index = capacity[0].days.map( d => d.day ).indexOf(startDate.getDate() )
        capacity[0].days[index].reserved += qtyBags
        capacity[0].days[index].capacity -= qtyBags
    }else if(startDate.getMonth() == endDate.getMonth() && startDate.getFullYear() == endDate.getFullYear()){
        //same month different days
        const startIndex = capacity[0].days.map( d => d.day ).indexOf(startDate.getDate() )
        const endIndex   = capacity[0].days.map( d => d.day ).indexOf(endDate.getDate() )
        for( let x = startIndex; x <= endIndex; x++ ){
            capacity[0].days[x].reserved += qtyBags
            capacity[0].days[x].capacity -= qtyBags
        }

    }else{
        //different months same year. guessing people will only do this inbetween months
        // needs reworking if people are going to be stashing for more than 2 months.
        // Will also work for different months and year cases. ie dec to jan
        const startDateStart = capacity[0].days.map( d => d.day ).indexOf( startDate.getDate() )
        const startDateEnd   = capacity[0].days.map( d => d.day ).indexOf( new Date(startDate.getFullYear(),startDate.getMonth()+1, 0)  )
        const endDateStart   = 0// day 1 will be index 0-zero
        const endDateEnd     = capacity[1].days.map( d => d.day ).indexOf( endDate.getDate()  )
        
        for( let x = startDateStart; x <= startDateEnd; x++ ){
            capacity[0].days[x].reserved += qtyBags
            capacity[0].days[x].capacity -= qtyBags
        }

        for( let x = endDateStart; x <= endDateEnd; x++ ){
            capacity[1].days[x].reserved += qtyBags
            capacity[1].days[x].capacity -= qtyBags
        }

    }
    

    //figure out how to record the changes in capacities
    stripe.charges.create({
        amount: (sumTotal * 100),
        currency: "usd",
        description: "Reservation over at StashIt!",
        source: token,
        }, 
        function(err, charge) {
        //asynchronously called
        if(err){
            //if there's an error, it returns back to the previous route with an error warning
            req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
            res.redirect('back')
            return  
        }
        stashed.charge = charge

        //first save record .then() do loop to save capacity changes, then redirect. IN THIS ORDER
        turbo.create( collections.stashed, stashed )
        .then(data => {
            return 
        })
        .then( () => {
            turbo.fetchUser( user.id )
            .then( user => {
                return user
            })
            .then(user => {
                user.payout += sumTotal
                turbo.updateUser(user.id, user )
                .then(updatedUser => {
                    return
                })
                return
            })
            return
        })
        .then(stash => {
            for( let x = 0; x < capacity.length; x++ ){
                //save ids for records?
                turbo.updateEntity( collections.capacities, capacity[x].id, capacity[x] )
                .then(data => {
                    return
                })
                .then(() => {
                    if( x == capacity.length - 1 ){
                        res.status(200).json({
                            hi: "hi"
                        })
                        return
                    }
                    return
                })
            }
        })
        .catch(err => {
            req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
            res.redirect('back')
            return  
        })
    })
}

module.exports = {
    payment: payment
}
