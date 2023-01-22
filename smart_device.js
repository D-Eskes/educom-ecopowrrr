import express from "express"
import {SmartDevice, Device, DeviceOuput} from "./lib/mongo_smart_device.js"
import {generateHash} from "random-hash"


const device_output = new DeviceOuput()
const device = new Device(device_output)
const smart_device = new SmartDevice(device)



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


app.get("/message", function(request, response) {

    const postcode = request.query.postcode
    const number = request.query.number

    console.log("called 0")

    smart_device.retrieve(postcode, number)
    .then(async function(result) {

        console.log("called 1")

        if (!result)
            response.send("No entry found")

        console.log("called 2")

        const date = new Date();

        const devices = []
        for (let i=0; i < result[0].device.length; i++) {

            const device_current = result[0].device[i]
            const output = device_current.device_output
            
            /// Start - Creating Fake Data ///
            let latest 
            for (let j=0; j < output.length; j++) {

                if (!latest) {
                    latest = output[j]
                }

                if (latest.date < output[j].date) {
                    latest = output[j]
                }
                
            }

            const factor_yield = (0.3 * Math.random()) + 0.85
            const factor_surplus = (0.6 * Math.random()) + 0.0

            let output_yield = null
            let output_surplus = null

            let days = date.getDate()
            if (latest) {
                days = (date - latest.date) / (1000 * 3600 * 24)
            }
 
            output_yield = days * (25 / 31) * factor_yield
            output_surplus = output_yield * factor_surplus


            device_output.create({
                device_id: device_current._id.toString(),
                date: date,
                yield: output_yield,
                surplus: output_surplus,
            })
            /// End - Creating Fake Data ///
            
            /// data ///
            let total_yield = output_yield
            let total_surplus = output_surplus
            let month_yield = output_yield
            let month_surplus = output_surplus
            for (let j=0; j < output.length; j++) {

                total_yield += output[j].yield
                total_surplus += output[j].surplus

                const _date = new Date(output[j].date)
                if (_date.getFullYear() == date.getFullYear() && _date.getMonth() == date.getMonth()) {
                    month_yield += output[j].yield
                    month_surplus += output[j].surplus
                }
            }

            devices.push({
                serial_number: device_current.serial_number,
                device_type: device_current.type,
                device_status: device_current.status,
                device_total_yield: total_yield,
                device_total_surplus: total_surplus,
                device_monthly_yield: month_yield,
                device_monthly_surplus: month_surplus
            })
        }

        const message = {
            "message_id": generateHash({length: 20}),
            "device_id": result[0]._id,
            "device_status": result[0].status,
            "date": date,
            "devices": devices
        }

        response.send(message)
    })
    .catch(function(error) {
        console.log(error)
        response.send(error)
    })
})

app.put("/status", function(request, response) {
    const status = request.query.status
    const postcode = request.query.postcode
    const number = request.query.number


    if (!["active", "inactive"].includes(status)) {
        response.send({error: "given status is neither 'active' nor 'inactive'"})
    }

    smart_device.update(postcode, number, {status: status})
    .then(function(result) {
        console.log(result)
        response.send(result)
    })
    .then(function(error) {
        response.send(error)
    })


})

app.put("/status/device", function(request, response) {
    const status = request.query.status
    const serial_number = request.query.serial_number


    if (!["active", "inactive"].includes(status)) {
        response.send({error: "given status is neither 'active' nor 'inactive'"})
    }
    
    device.update(serial_number, {status: status})
    .then(function(result) {
        console.log(result)
        response.send(result)
    })
    .then(function(error) {
        response.send(error)
    })


})




/// RUN ///
app.listen(5000, function() {
    console.log("Running!")
})