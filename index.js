import express from "express"
import {Client, Device, DeviceOuput} from "./lib/mongo.js"
import fetch from "node-fetch"
import cors from "cors"
import * as XLSX from "XLSX"



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

function createWorkBook() {
    const aoaData = [
        ['name', 'code', 'author'],
        ['Diary', 'diary_code', 'Pagorn'],
        ['Note', 'note_code', 'Pagorn'],
        ['Medium', 'medium_code', 'Pagorn'],
    ];

    const workSheet = XLSX.utils.aoa_to_sheet(aoaData);
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet 1');

    XLSX.writeFile(workBook, './documents/spreadsheet/sample.xlsx');
}


function createWorkBook1() {
    const aoaData = [
        ['name', 'code', 'author'],
        ['Diary', 'diary_code', 'Pagorn'],
        ['Note', 'note_code', 'Pagorn'],
        ['Medium', 'medium_code', 'Pagorn'],
    ];

    const workSheet = XLSX.utils.aoa_to_sheet(aoaData);
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet 1');

    XLSX.writeFile(workBook, './documents/spreadsheet/sample.xlsx');
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

async function updateStatusDevice(serial_number, status) {
    const url = new URL("http://localhost:5000/status/device")

    url.search = new URLSearchParams({
        serial_number: serial_number,
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

async function getMessage(postcode, number) {
    const url = new URL("http://localhost:5000/message")

    url.search = new URLSearchParams({
        postcode: postcode,
        number: number,
    }).toString()


    return fetch(url, {
        method: 'GET',
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

app.get("/messages", function(request, response) {
    client.retrieve("").then(function(result) {
        for (let i=0; i<result.length; i++) {
            const current_client = result[i]
            
            getMessage(current_client.postcode, current_client.number).then(function(message) {
  
                if (message.device_status == "inactive") {
                    return
                }

                const serial_numbers = current_client.device.map(function(device) {return device.serial_number})
                for (let j=0; j < message.devices.length; j++) {
                    
                    const current_device = message.devices[j]
                    if (!serial_numbers.includes(current_device.serial_number)) {
                        device.create({
                            client_id: current_client._id.toString(),
                            serial_number: current_device.serial_number,
                            type: current_device.device_type
                        })
                        updateStatusDevice(current_device.serial_number, "active")
                    }
                    
                    if (current_device.status == "inactive") {
                        return
                    }

                    const device_id = current_client.device.filter(device => device.serial_number == current_device.serial_number)[0]._id.toString()
                    console.log(device_id)
                    device_output.create({
                        device_id: device_id,
                        date: message.date,
                        total_yield: current_device.device_total_yield,
                        total_surplus: current_device.device_total_surplus,
                        monthly_yield: current_device.device_monthly_yield,
                        monthly_surplus: current_device.device_monthly_surplus
                    })  
                }
            })
        }
        response.send({message: "received"})
    })
    .catch(function(error) {
        response.send(error)
    })

    
})




/// TEST ////
function getDeviceOutputMonthLatest(year, month, device) {
    let latest = none
    for (let i=0; i < device.device_output.length; i++) {
        const device_output = device.device_output[k]

        date = new Date(device.date)

        if (year != date.getFullYear()) {
            continue
        }

        if (month == date.getMonth()) {
            if (!latest) {
                latest = device_output
            }

            if (latest.date < device_output.date) {
                latest = device_output
            }
        }
    }

    return latest
}


app.get("/test/spreadsheet1", function(request, response) {

    client.retrieve("").then(function(result) {

        const array = []
        const headers = ["name"]
        
        const year_first = 2020
        const year_current = new Date().getFullYear()
        for (let year=year_first; year < year_current + 1; year++) {
            headers.push(year.toString())
        }

        array.push(headers)
        for (let i=0; i < result.length; i++) {
            const row = []
            const _client = result[i]
            
            row.push(_client.name)

            for (let year=year_first; year < year_current + 1; year++) {
                
                let output = 0
                for (let j=0; j < _client.device.length; j++) {
                    const _device = _client.device[j]

                    for (let month=0; month < 12; month++) {
                        const _device_output = getDeviceOutputMonthLatest(year, month, _device)

                        if (_device_output) {
                            output += _device_output.monthly_surplus
                        }

                    }

                }

                row.push()
            }


           

        }
        response.send(array)
    })


})




/// RUN ///
app.listen(4000, function() {
    console.log("Running!")
})