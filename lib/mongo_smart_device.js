import {ObjectId} from "mongodb"
import {mongoUrl, create, retrieve} from "./mongo.js"


const DATABASE = "client"


export class SmartDevice {

    constructor(device) {
        this.device = device
    }

    retrieve(postcode, number) {
        const database = DATABASE
        const collection = "smart_device"
        const query = {}
        if (postcode) {query.postcode = postcode}
        if (number) {query.number = number}
        
        const self = this
        return retrieve(database, collection, query).then(async function(result) {
            for (let i=0; i < result.length; i++) {
 
                await self.retrieveDevice(result[i]._id.toString()).then(function(device) {
                    // device = result
                    result[i].device = device
                })
                // result[i].device = device
            }
            return result
        })
    }

    create(data) {
        const database = DATABASE
        const collection = "smart_device"

        const data_insert = {
            postcode: data.postcode,
            number: data.number,
            status: data.status
        }

        return create(database, collection, data_insert)
    }

    update() {

    }

    retrieveDevice(smart_device_id) {
        return this.device.retrieve(smart_device_id)
    }
}


export class Device {

    constructor(device) {
        this.device = device
    }

    retrieve(client_id) {
        const database = DATABASE
        const collection = "device"
        const query = {client_id: client_id}
        
        const self = this
        return retrieve(database, collection, query)
    }

    add() {

    }

    update() {

    }

    retrieveDevice(smart_device_id) {
        
    }
}