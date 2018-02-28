const turbo     = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const constants = require('../constants') 

const signin = (req, res) => {

    const credentials = { username: req.body.username, password: req.body.password }
    turbo.login(credentials)
    .then(data => {
        const canEdit = (data.role != constants.customer.seller || data.role != constants.customer.buyer)
        req.vertexSession.user = { id: data.id, username: data.username, 
            firstName: data.firstName, lastName: data.lastName, role: data.role,
            email: data.email, loggedIn: true, payout: 0,
            notloggedIn:false, canEdit: canEdit
        }

        turbo.fetch( collections.cart, { user_id: data.id } )
        .then(cart => {
            req.vertexSession.cart = cart[0]
            console.log("works!")
            res.status(200).json({
                works: true
            })
            return
        })
        return
    })
    .catch(err => {
        console.log("err: ",err.message)
        res.status(500).json({
            msg: err.message
        })
        return
    })
}

const signup = (req, res) => {
    // post request that creates a new user
    const body    = req.body

    /*res.status(200).json({
        req: req.body
    })
    console.log('req: ',req.body)
    return*/

    const newUser = { username: body.username, email: body.email, password: body.pass, role: body.role }

    turbo.createUser(newUser)
    .then(data => {
        const canEdit = (data.role != constants.customer || data.role != constants.stasher )
        req.vertexSession.user = { id: data.id, username: data.username, 
            firstName: data.firstName, lastName: data.lastName, role: data.role,
            email: data.email, loggedIn: true,
            notloggedIn:false, canEdit: canEdit
        }
        const cart = {
            user_id: data.id,
            items: [],
            numItems: 0,
            total: 0
        }
        const user = data
        turbo.create( collections.cart , cart )
        .then(cart => {
            req.vertexSession.cart = cart
            /*req.vertexSession.msg = { show: true, 
                text: "Success!!! Please complete your profile, and Add at least ONE Address",
                type:constants.alertTypes.success }*/
            res.status(200).json({
                redirectTo: "/"
            })
            return 
        })    
    })
    .catch(err => {
        res.status(500).json({
            msg: err.message
        })
        return
    })
}

const signout = (req, res) => {
    //resets all session data
    req.vertexSession.user = { id: '', username: '', email:'', loggedIn: false, notloggedIn: true, canEdit:false, role:'' } 
    req.vertexSession.msg  = { show: false, text:'', type:'' }
    req.vertexSession.cart = { user_id:'', items:[], total:0, numItems:0 }
    res.redirect("back")
    return
}


module.exports = {
    signin: signin,
    signup: signup,
    signout: signout
}