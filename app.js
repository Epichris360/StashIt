const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})

// initialize app
const app = vertex.app()


// import routes
const index     = require('./routes/index'    )
const api       = require('./routes/api'      )
const user      = require('./routes/user'     )
const dashboard = require('./routes/dashboard')
const locations = require('./routes/locations')
const dash      = require('./routes/dash'     )

// set routes
app.use('/',          index    )
app.use('/api',       api      ) // sample API Routes
app.use('/user',      user     )
app.use('/dashboard', dashboard)
app.use('/location',  locations)
app.use('/dash',      dash     )

module.exports = app