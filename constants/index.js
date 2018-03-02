module.exports = {
    admin: "admin",
    manager: "manager",
    stasher:  "stasher",
    customer: "customer",

    costFirstDay: 5,
    costSecondDay:4,

    listCats: [
        { name: "Hotels" },
        { name: "Shops" },
        { name: "Restaurants" },
        { name: "Cafe" },
        { name: "Fitness" },
        { name: "WareHouse" },
        { name: "House" }
    ],

    cities: [
        { name: "NYC", state: "Ny" },
        { name: "SanFrancisco", state: "CA" },
        { name: "LA", state: "CA" },
        { name: "Austin", state: "TX" }
    ],

    times: [
        {name:"closed", time:null},
        {name:"1 AM", time:1},{name:"2 AM", time:2},{name:"3 AM", time:3},{name:"4 AM", time:4},
        {name:"5 AM", time:5},{name:"6 AM", time:6},{name:"7 AM", time:7},{name:"8 AM", time:8},
        {name:"9 AM", time:9},{name:"10 AM",time:10},{name:"11 AM",time:11},{name:"12 PM",time:12},
        {name:"1 PM", time:13},{name:"2 PM", time:14},{name:"3 PM", time:15},{name:"4 PM", time:16},
        {name:"5 PM", time:17},{name:"6 PM", time:18},{name:"7 PM", time:19},{name:"8 PM", time:20},
        {name:"9 PM", time:21},{name:"10 PM", time:22},{name:"11 PM", time:23},{name:"12 AM", time:0}
    ],

    months: [
        {num:1, month:"January"}, {num:2, month:"February"}, {num:3, month:"March"},
        {num:4, month:"April"}, {num:5, month:"May"}, {num:6, month:"June"}, {num:7, month:"July"}, 
        {num:8, month:"August"}, {num:9, month:"September"}, {num:10, month:"October"},
        {num:11, month:"November"}, {num:12, month:"December"}
    ],    

    stashStatus: [
        {name:"Check In",    class:"check-in",    id:0, btnColor:"btn-green"  }, 
        {name:"Check Out",   class:"check-out",   id:1, btnColor:"btn-orange" }, 
        {name:"Checked Out", class:"checked-out", id:2, btnColor:"btn-red"    }
    ]

}
