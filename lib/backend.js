import {create, update, retrieve} from "./mongo.js"

const DATABASE = "backend"


export class Client {
    constructor(device) {
        this.device = device
    }

    async retrieve(id) {
        const database = DATABASE
        const collection = "client"
        const query = id ? {_id: new ObjectId(id)} : {}
        
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
        const collection = "client"

        const data_insert = {
            name: data.name,
            IBAN: data.IBAN,
            postcode: data.postcode,
            number: data.number,
            municipality: data.municipality,

        }

        return create(database, collection, data_insert)
    }

    async retrieveDevice(id) {
        return this.device.retrieve(id)
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
            client_id: data.client_id,
            serial_number: data.serial_number,
            type: data.type
            
        }

        return create(database, collection, data_insert)
    }

    async retrieveDeviceOutput(id) {
        return this.device_output.retrieve(id)
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
            total_yield: data.total_yield,
            total_surplus: data.total_surplus,
            monthly_yield: data.monthly_yield,
            monthly_surplus: data.monthly_surplus
        }

        return create(database, collection, data_insert)
    }

}

export class Price {
    constructor() {

    }

    async retrieve(id) {
        const database = DATABASE
        const collection = "price"
        const query = id ? {_id: new ObjectId(id)} : {}

        return retrieve(database, collection, query)
    }

    async create(data) {
        const database = DATABASE
        const collection = "price"

        const data_insert = {
            year: data.year,
            month: data.month,
            price: data.price,
        }

        return create(database, collection, data_insert)
    }
}
