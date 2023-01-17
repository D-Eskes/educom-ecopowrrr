import express from "express"
import mongo from "../lib/mongo.js"

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


/// GET ///
app.get("/", function(request, response) {
    
    mongo.list(null)
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })

})

app.get("/:database", function(request, response) {

    var database = cleanName(request.params.database)
    
    mongo.listCollection(database)
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })

})

app.get("/:database/:collection", function(request, response) {

    var database = cleanName(request.params.database)
    var collection = cleanName(request.params.collection)

    mongo.fetch(database, collection, null)
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })

})

app.get("/:database/:collection/:id", function(request, response) {

    var database = cleanName(request.params.database)
    var collection = cleanName(request.params.collection)
    
    mongo.fetch(database, collection, request.params.id)
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })

})

/// POST ///
app.post("/:database/:collection", (request, response) => {

    var database = cleanName(request.params.database)
    var collection = cleanName(request.params.collection)

    let data = request.body
  
    mongo.create(database, collection, data)
    .then(result => {
        response.send(result)
    })
    .catch(error => {
        response.send(error)
    })

})

/// PUT ///
app.put("/:database/:collection/:id", function(request, response) {
    
    var database = cleanName(request.params.database)
    var collection = cleanName(request.params.collection)

    let data = request.body

    mongo.update(database, collection, request.params.id, data)
    .then(function(result) {
        response.send(result)
    })
    .catch(function(error) {
        response.send(error)
    })

})

/// DELETE ///
app.delete("/:database/:collection/:id", function(request, response) {

    var database = cleanName(request.params.database)
    var collection = cleanName(request.params.collection)

    mongo.delete(database, collection, request.params.id)
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