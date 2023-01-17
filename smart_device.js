import express from "express"
import {SmartDevice, Device} from "./lib/mongo_smart_device.js"


const device = new Device()
const smart_device = new SmartDevice(device)

smart_device.retrieve("").then(result => console.log(result))


const app = express()
app.use(express.json())
app.use((request, result, next) => {
    result.setHeader("Access-Control-Allow-Origin", "*")
    result.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    result.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
    next()
})

function cleanName(name) {
    return name.toLowerCase().trim()
}



/// RUN ///
app.listen(5000, function() {
    console.log("Running!")
})