import {MongoClient, ObjectId} from "mongodb"

export const mongoUrl = "mongodb://localhost:27027"
const DATABASE = "backend"


export function create(database, collection, data) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(mongoUrl, function(error, client) {
            if (error) {
                reject({error: error})
            }

            client.db(database).collection(collection).insertOne(data, function(error, result) {
                console.log(data)
                client.close()
                if (error) {
                    reject({error: error})
                }
                resolve(result)
            })
        })
    })

}

export function retrieve(database, collection, query) {

    return new Promise(function(resolve, reject) {

        MongoClient.connect(mongoUrl, function(error, client) {
            if (error) {
                reject({error: error})
            }

            client.db(database).collection(collection).find(query).toArray(function(error, result) {
                client.close()
                if (error) {
                    reject({error: error})
                }
                // console.log(result)
                resolve(result)
            })
        })
    })
}


/// Back End ///
export class Client {
    constructor(device) {
        this.device = device
    }

    retrieve(id) {
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

    create(data) {
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

    retrieveDevice(id) {
        return this.device.retrieve(id)
    }
}

export class Device {
    constructor(device_output) {
        this.device_output = device_output
    }

    retrieve(client_id) {
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

    create(data) {
        const database = DATABASE
        const collection = "device"

        const data_insert = {
            client_id: data.name,
            serial_number: data.serial_number,
            type: data.type
            
        }

        return create(database, collection, data_insert)
    }

    retrieveDeviceOutput(id) {
        return this.device_output.retrieve(id)
    }

}

export class DeviceOuput {
    constructor() {
        
    }

    retrieve(device_id) {
        const database = DATABASE
        const collection = "device_output"
        const query = {device_id: device_id}

        return retrieve(database, collection, query)
    }

    create(data) {
        const database = DATABASE
        const collection = "device"

        const data_insert = {
            device_id: data.device_id,
            date: data.date,
            total_yield: data.total_yield,
            total_surplus: data.total_surplus,
            month_yield: data.month_yield,
            month_surplus: data.month_surplus
        }

        return create(database, collection, data_insert)
    }

}
