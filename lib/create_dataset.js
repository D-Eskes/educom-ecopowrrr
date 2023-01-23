import {create} from "./mongo.js"
import {SmartDevice, Device} from "./mongo_smart_device.js"
import fetch from "node-fetch"

const device = new Device()
const smart_device = new SmartDevice(device)


async function createData(postcode, number, name, IBAN) {

    smart_device.create({
        postcode: postcode,
        number: number,
        status: "inactive"
    }).then(function(result) {
        if (!result["acknowledged"]) {
            return
        }

        for (let i=0; i < 3; i++) {

            device.create({
                smart_device_id: result["insertedId"].toString(),
                serial_number: Math.round(10**9 * Math.random()),
                type: "solar",
                status: "inactive"

            })
        }
    })
    
    // const url = new URL("http://localhost:4000/register")

    // url.search = new URLSearchParams({
    //     postcode: postcode,
    //     number: number,
    //     name: name,
    //     IBAN: IBAN
    // }).toString()


    // return fetch(url, {
    //     method: 'POST',
    // })
    // .then(result => result.json())
    
}


createData("6363AZ", 18, "Daan", 123456789)