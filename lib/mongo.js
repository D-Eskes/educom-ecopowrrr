import {MongoClient} from "mongodb"

export const mongoUrl = "mongodb://localhost:27027"


export async function create(database, collection, data) {
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

export async function retrieve(database, collection, query) {

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

export async function update(database, collection, query, data) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(mongoUrl, function(error, client) {
            if (error) {
                reject({error: error})
            }

            client.db(database).collection(collection).updateOne(query, {$set: data}, function(error, result) {
                client.close()
                if (error) {
                    reject({error: error})
                }
                resolve(result)
            })
        })
    })
}
