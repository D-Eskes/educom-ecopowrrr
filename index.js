import express from "express"
import {Client, Device, DeviceOuput} from "./lib/mongo.js"
import fetch from "node-fetch"
import cors from "cors"


const POSTCODE_TOKEN = "1c6f7003-33e9-4026-a5cc-203648cd9a4d"

const device_output = new DeviceOuput()
const device = new Device(device_output)
const client = new Client(device)


const app = express()
app.use(cors())
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



async function updateStatusSmartDevice(postcode, number, status) {
    const url = new URL("http://localhost:5000/status")

    url.search = new URLSearchParams({
        postcode: postcode,
        number: number,
        status: status
    }).toString()


    return fetch(url, {
        method: 'PUT',
        headers: {
            "Authorization": 'Bearer ' + POSTCODE_TOKEN
        },
    })
    .then(result => result.json())
    
}

async function getPostcodeData(postcode, number) {
    const url = new URL("https://postcode.tech/api/v1/postcode/full")

    url.search = new URLSearchParams({
        postcode: postcode,
        number: number,
    }).toString()


    return fetch(url, {
        method: 'GET',
        headers: {
            "Authorization": 'Bearer ' + POSTCODE_TOKEN
        },
    })
    .then(result => result.json())
}



app.post("/register", function(request, response) {
    const postcode = request.query.postcode
    const number = request.query.number


    getPostcodeData(postcode, number)
    .then(async function(result) {

        client.create({
            name: request.query.name,
            IBAN: request.query.IBAN,
            postcode: postcode,
            number: number,
            municipality: result.municipality
        })

        updateStatusSmartDevice(postcode, number, "active")

        response.send({
            message: "client created"
        })
    })
    .catch(function(error) {
        response.send(error)
    })
})




/// TEST ////
app.get("/test/location", function(request, response) {
    
    const url = new URL("https://postcode.tech/api/v1/postcode/full")

    url.search = new URLSearchParams({
        "postcode": request.query.postcode,
        "number": request.query.number,
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