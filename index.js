import express from "express"
import {Client, Device, DeviceOuput} from "./lib/mongo.js"


const POSTCODE_TOKEN = "1c6f7003-33e9-4026-a5cc-203648cd9a4d"

const device_output = new DeviceOuput()
const device = new Device(device_output)
const client = new Client(device)

client.retrieve("").then(result => console.log(result))


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




/// Call to postcode.tech ////
app.get("/location/:postcode/:number", function(request, response) {
    
    const url = new URL("https://postcode.tech/api/v1/postcode/full")

    url.search = new URLSearchParams({
        "postcode": request.params.postcode,
        "number": request.params.number,
    }).toString()


    fetch(url, {
        method: 'GET',
        headers: {
            "Authorization": 'Bearer ' + POSTCODE_TOKEN
        },
    })
    .then(result => result.json())
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })
})





/// RUN ///
app.listen(4000, function() {
    console.log("Running!")
})