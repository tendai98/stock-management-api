const firebaseAppConfig = require("./config.json") // Load a Firebase Project Configuration JSON file
const firebase = require("firebase")
const express = require("express")

const security = require("./security-module")
const stock = require("./stock-control")

const port = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

firebase.initializeApp(firebaseAppConfig);

// Initialize modules with firebase app object
security.init(firebase)
stock.init(firebase)

app.post("/security", security.route)
app.post("/stock", stock.route)

app.listen(port, () => {
    console.log(`[+] Server Online: ${port}`)
})
