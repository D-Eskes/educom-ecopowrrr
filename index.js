import express from "express"
import {Client, Device, DeviceOuput, Price} from "./lib/mongo.js"
import fetch from "node-fetch"
import cors from "cors"
import * as XLSX from "XLSX"


const POSTCODE_TOKEN = "1c6f7003-33e9-4026-a5cc-203648cd9a4d"

const device_output = new DeviceOuput()
const device = new Device(device_output)
const client = new Client(device)
const price = new Price()




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

function createWorkBookExample() {
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

function createWorkBook(sheets, name) {

    const workBook = XLSX.utils.book_new();

    for (let sheet in sheets) {
        const workSheet = XLSX.utils.aoa_to_sheet(sheets[sheet]);
        XLSX.utils.book_append_sheet(workBook, workSheet, sheet);
    }

    XLSX.writeFile(workBook, `./documents/spreadsheet/${name}.xlsx`);
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
                    // console.log(device_id)
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

    let latest = null
    for (let i=0; i < device.device_output.length; i++) {
        const device_output = device.device_output[i]

        const date = new Date(device_output.date)

        if (year != date.getFullYear()) {

            continue
        }


        // console.log(month, date.getMonth())

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

async function getPriceDate(date) {

    return price.retrieve("").then(
        function(result) {

            result.sort(function(a, b) {
                if (a.year > b.year) {
                    return -1
                }
                if (a.year < b.year) {
                    return 1
                }

                if (a.month > b.month) {
                    return -1
                }
                if (a.month < b.month) {
                    return 1
                }

                return 0
            })

            for (let i=0; i < result.length; i++) {
                const _price = result[i]

                const year = date.getFullYear()
                const month = date.getMonth() + 1
                if (year >= _price.year && month >= _price.month) {
                    // console.log(_price)
                    result = _price.price / 100
                    break
                }
            }
            return result
        }
    )

}



function getYearlySurplus(year, device) {
    let output = 0
    for (let month=0; month < 12; month++) {
        const device_output = getDeviceOutputMonthLatest(year, month, device)

        if (device_output) {
            output += device_output.monthly_surplus
        }

    }
    return output
}

function getYearlySurplusAllDevices(year, devices) {
    let output = 0
    for (let j=0; j < devices.length; j++) {

        output += getYearlySurplus(year, devices[j])
    
    return output
    }
}


async function getYearlyPrice(year, device) {
    let output = 0
    for (let month=0; month < 12; month++) {
        const device_output = getDeviceOutputMonthLatest(year, month, device)

        // console.log(_device_output, year, month)
        if (device_output) {
            await getPriceDate(new Date(device_output.date)).then(function(result_price) {
                // console.log(result_price)
                // console.log(device_output.monthly_surplus)
                output += device_output.monthly_surplus * result_price
            })
        }
    }
    return output
}

async function getYearlyPriceAllDevices(year, devices) {
    let output = 0
    for (let j=0; j < devices.length; j++) {
        const device = devices[j]

        await getYearlyPrice(year, device).then(function(result) {
            output += result
        })

    }
    return output
}


function getYearlyOutput(year, device) {
    let output = 0
    for (let month=0; month < 12; month++) {
        const device_output = getDeviceOutputMonthLatest(year, month, device)

        if (device_output) {
            output += device_output.monthly_yield
        }

    }
    return output
}

function getYearlyOutputAllDevices(year, devices) {
    let output = 0
    for (let j=0; j < devices.length; j++) {

        output += getYearlyOutput(year, devices[j])
    
    return output
    }
}







function getSpreadsheetData1a() {

    return client.retrieve("").then(async function(result) {

        const array = []
        const headers = ["name"]
        
        const year_first = 2020
        const year_current = new Date().getFullYear()
        for (let year=year_first; year < year_current + 1; year++) {
            headers.push(year)
        }

        // console.log(result)
        
        array.push(headers)
        for (let i=0; i < result.length; i++) {
            const row = []
            const client = result[i]
            
            row.push(client.name)

            for (let year=year_first; year < year_current + 1; year++) {
                
                await getYearlyPriceAllDevices(year, client.device).then(function(result) {
                    row.push(result)
                })
            }
            array.push(row)
        }

        result = array
        return result

    })
}

function getSpreadsheetData1b() {

    return client.retrieve("").then(async function(result) {

        const array = []
        const headers = ["name"]
        
        const year_first = 2020
        const year_current = new Date().getFullYear()
        for (let year=year_first; year < year_current + 1; year++) {
            headers.push(year)
        }

        // console.log(result)
        
        array.push(headers)
        for (let i=0; i < result.length; i++) {
            const row = []
            const client = result[i]
            
            row.push(client.name)

            for (let year=year_first; year < year_current + 1; year++) {
                
                const output = getYearlySurplusAllDevices(year, client.device)
                
                row.push(output)
            }
            array.push(row)
        }

        result = array
        return result

    })
}

function getSpreadsheetData3a() {

    return client.retrieve("").then(async function(result) {

        const array = []
        const headers = ["name", "revenue", "output", "surplus"]
        
        const year_current = new Date().getFullYear()

        const revenue = []
        const output = []
        const surplus = []
        
        array.push(headers)
        for (let i=0; i < result.length; i++) {
            const client = result[i]

            if (revenue.indexOf(client.municipality) == -1) {
                revenue[client.municipality] = 0 
                output[client.municipality] = 0 
                surplus[client.municipality] = 0
            }

            await getYearlyPriceAllDevices(year_current, client.device).then(function(result) {
                revenue[client.municipality] += result
            })

            output[client.municipality] += getYearlyOutputAllDevices(year_current, client.device)
            
            surplus[client.municipality] += getYearlySurplusAllDevices(year_current, client.device)

        
        }

        console.log(array)
        console.log(revenue)
        console.log(output)
        console.log(surplus)

        result = array
        return result

    })
}




getSpreadsheetData3a()



app.get("/test/spreadsheet1", async function(request, response) {

    const sheets = []

    await getSpreadsheetData1a().then(function(result) { 
        sheets.total_revenue = result
    })
    await getSpreadsheetData1b().then(function(result) {
        sheets.total_purchased = result
    })

    const date = new Date()

    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1)}`.padStart(2, "0")

    const day = `${date.getDate()}`.padStart(2, "0")
    const hour = `${date.getHours()}`.padStart(2, "0")
    const minute = `${date.getMinutes()}`.padStart(2, "0")

    const date_string = `${year}${month}${day}_${hour}${minute}`
    createWorkBook(sheets, `spreadsheet1_${date_string}`)
    
    response.send({"message": "spreadsheet created"})
})



/// RUN ///
app.listen(4000, function() {
    console.log("Running!")
})