import {ObjectId} from "mongodb"
import {mongoUrl, create, retrieve, update} from "./mongo.js"


const DATABASE = "client"


export class SmartDevice {

    constructor(device) {
        this.device = device
    }

    async retrieve(postcode, number) {
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

    async create(data) {
        const database = DATABASE
        const collection = "smart_device"

        const data_insert = {
            postcode: data.postcode,
            number: data.number,
            status: data.status
        }

        return create(database, collection, data_insert)
    }

    async update(postcode, number, data) {
        const database = DATABASE
        const collection = "smart_device"
        const query = {
            postcode: postcode, 
            number: number
        }

        return update(database, collection, query, data)
    }

    retrieveDevice(smart_device_id) {
        return this.device.retrieve(smart_device_id)
    }
}

export class Device {

    constructor(device_output) {
        this.device_output = device_output
    }

    async retrieve(client_id) {
        const database = DATABASE
        const collection = "device"
        const query = {client_id: client_id}
        
        const self = this
        return retrieve(database, collection, query).then(async function(result) {
            for (let i=0; i < result.length; i++) {
 
                await self.retrieveDeviceOutput(result[i]._id.toString()).then(function(device_output) {
                    // device_output = result
                    result[i].device_output = device_output
                })
                // result[i].device_output = device_output
            }
            return result
        })
    }

    async create(data) {
        const database = DATABASE
        const collection = "device"

        const data_insert = {
            smart_device_id: data.smart_device_id,
            serial_number: data.serial_number,
            type: data.type,
            status: data.status
        }

        return create(database, collection, data_insert)
    }

    async retrieveDeviceOutput(device_id) {
        return this.device_output.retrieve(device_id)
    }
}

export class DeviceOuput {
    constructor() {
        
    }

    async retrieve(device_id) {
        const database = DATABASE
        const collection = "device_output"
        const query = {device_id: device_id}

        return retrieve(database, collection, query)
    }

    async create(data) {
        const database = DATABASE
        const collection = "device_output"

        const data_insert = {
            device_id: data.device_id,
            date: data.date,
            yield: data.yield,
            surplus: data.surplus
        }

        return create(database, collection, data_insert)
    }

}

