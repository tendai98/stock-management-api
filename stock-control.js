const events = require("events")
const misc = require("./misc")
let firebase = null
const TOKEN_LIFETIME = 7200

const eventCore = new events.EventEmitter()

//////////////////////////////////////////////////////////////////////////////////////////////

function executeSystemOperation(username, token, res, callback, data){

    firebase.database().ref("SessionTokens").child(username).on("value", (snapshot) => {

        if(snapshot.val()){

            let tokenData = snapshot.val()
            let currentTime = misc.timestamp()         // Get current timestamp
            let tokenTimestamp = tokenData.timestamp       // Get timstamp for when token was made
            
            firebase.database().ref("SessionTokens").child(username).off()

            if(token === tokenData.token){

                if (((currentTime - tokenTimestamp) / 1000) >= TOKEN_LIFETIME){

                    firebase.database().ref("SessionTokens").child(username).remove()
                    res.json({message:"Session has expired. Please login", code:-200})

                }else{
                    callback(data, res)
                    firebase.database().ref("SessionTokens").child(username).child("timestamp").set(misc.timestamp())
                    
            }

            }else{
                res.json({message:"Invalid Token", code:-1})
            }

        }else{
            res.json({message:"Invalid username or password. Please login", code:-1})
        }
    }, (error) => {
        console.log(error)
    })
}


////////////////////////////// [Module Functions] ////////////////////////////////////

function setStock(object){

    function operation(data, res){

        let productId = misc.hash(data.productName)
        let condition = data.condition

        delete data.condition
        delete data.productId

        firebase.firestore()
            .collection(condition)
            .doc(productId)
            .set(data).then(e => {
                res.json({message:"Success", code:0})
            }).catch(e => {
                res.json({message:"Error setting stock", code:-1})
            })
    }

    if(object.res){

        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )
    }
}

function getStock(object){

    function operation(data, res){
        firebase.firestore().collection(data.condition).get().then(documents =>{
                
            let entries = {collections:[]}
            documents.forEach(document => {
                entries.collections.push(document.data())
            })

            res.json({message:"Success", code:0, data:entries})

        }).catch(e => {
            res.json({message:"Getting stock data", code:-1})
        })
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )        
    }
}

function removeStock(object){

    function operation(data, res){
        firebase.firestore()
            .collection(data.condition)
            .doc(misc.hash(data.target))
            .delete()

        res.json({message:"Success", code:0})
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )   
    }
}

function checkStockLevels(object){

    function operation(data, res){

        firebase.firestore()
        .collection(data.targetStockCategory)
        .get().then(snapshot1 => {

            let count = snapshot1.size

            firebase.firestore()
                .collection(data.targetReferenceValues)
                .doc(data.valueCollection)
                .get().then(snapshot2 => {
                    
                    let parameters = snapshot2.data()
                    let checkData = {}

                    if(parameters){
                        // Check values against preset thresholds in th database

                            let key = data.valueSelector
                            checkData.threshold = parameters[key]
                            checkData.itemCount = count

                            res.json({errorCode:0, message:"Success", data:checkData})
                    }else{
                        res.json({errorCode:-1, message:"No parameter data found"})
                    }

                }).catch(e => {
                    res.json({errorCode:-1, message:"An error has occured", verbose:e})
                })

        }).catch(e => {
            res.json({errorCode:-1, message:"An error has occured", verbose:e})
        })
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )
    }
   
}

function countStock(object){
   
    function operation(data, res){

        firebase.firestore()
            .collection(data.condition)
            .get().then(data => {
                res.json({message:"Success", code:0, data:data.size})
            }).catch(e => {
                res.json({message:"Error getting count", code:-1})
            })
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )
    }
}

function setOrder(object){

    function operation(data, res){

        let orderType = data.orderType
        let customerId = data.customerId

        delete data.orderType
        delete data.customerId

        firebase.firestore()
            .collection(orderType)
            .doc(customerId)
            .set(data).then(e => {
                res.json({message:"Success", code:0})
            }).catch(e => {
                res.json({message:"Error setting order", code:-1})
            })
    }

    if(object.res){

        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )
    }
}

function getOrders(object){
    
    function operation(data, res){

        firebase.firestore()
            .collection(data.orderType)
            .doc(data.customerId)
            .get().then(snapshot => {
                res.json({message:"Success", code:0, data:snapshot.data()})
            }).catch(e => {
                res.json({message:"Error getting order", code:0})
            })
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )   
    }
}

function removeOrder(object){

    function operation(data, res){

        firebase.firestore()
            .collection(data.orderType)
            .doc(data.customerId)
            .delete()
            
            res.json({message:"Success", code:0})

    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )   
    }

}

function setStockMinimum(object){

    function operation(data, res){

        let document = data.documentName
        let collection = data.collectionName

        delete data.documentName
        delete data.collectionName

        firebase.firestore()
            .collection(collection)
            .doc(document)
            .set(data).then(e => {
                res.json({message:"Done", code:0})
            }).catch(e => {
                res.json({message:"Error setting values", code:0})
            })
    }

    if(object.res){
        executeSystemOperation(
            object.authorization.username, 
            object.authorization.authToken,
            object.res,
            operation,
            object.data
        )
    }
}

////////////////////////////// [Module Functions] ////////////////////////////////////

////////////////////////////// [CORE Module Functions] ////////////////////////////////////


function initializeModule(firebaseObject){

    firebase = firebaseObject
    eventCore.addListener("set-stock", setStock)
    eventCore.addListener("get-stock", getStock)
    eventCore.addListener("remove-stock", removeStock)
    eventCore.addListener("count-stock", countStock)
    eventCore.addListener("set-order", setOrder)
    eventCore.addListener("get-orders", getOrders)
    eventCore.addListener("remove-order", removeOrder)
    eventCore.addListener("stock-minimum", setStockMinimum)
    eventCore.addListener("check-stock", checkStockLevels)

}

function executeRequest(parameters){
    return eventCore.emit(parameters.command, parameters.args)
}

function requestHandler(req, res){
    let request = req.body
    try{
        request.args.res = res

        if(! executeRequest(request)){
            res.json({message: "STOCKMOD:Command Not Supported", errorCode: -1})
        }
    }catch(e){
        res.json({message: "STOCKMOD:Invalid Request", errorCode: -2})
    }
}
////////////////////////////// [CORE Module Functions] ////////////////////////////////////

module.exports = {
   "init":initializeModule,
   "route": requestHandler,
   "run":executeRequest  
}