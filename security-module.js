
const creds = require("./creds.json")              // Load a system credentials JSON File
const events = require("events")
const misc = require("./misc")
let firebase = null
let systemActivated = false

const eventCore = new events.EventEmitter()

//////////////////////////// [Core System Security Features] ///////////////////////////////

function createUserToken(username){

    let timestamp = misc.timestamp()
    let hashToken = misc.token(misc.timestamp() + "STMS")

    firebase.database().ref("SessionTokens").child(username).set({
        timestamp: timestamp,
        token: hashToken,
    })

    return hashToken
}


////////////////////////////////// [SYSTEM AUTHORIZATION & ACTIVATION] //////////////////////////////////

function activateSystem(object){
        let data = object.data
        let res = null
        if(object.res){
            res = object.res

            firebase.auth().signInWithEmailAndPassword(data.email, data.password).then(e => {
                createUserToken(data.email.split("@")[0])
                res.json({message:"System Authorization Complete", errorCode:0})

           }).catch(e => {
               res.json(e)
           })
        }
}

function activateForUser(object){
    let res = null

    if(object.res){
        res = object.res
        
        if(!systemActivated){

            firebase.auth().signInWithEmailAndPassword(creds.email, creds.password).then(e => {
                    createUserToken(creds.email.split("@")[0])
                    res.json({message:"System Authorization Complete", errorCode:0})
                    systemActivated = true
            }).catch(e => {
                    res.json({message:"Authorization Failed", errorCode:-1})
            })

        }else{
            res.json({message:"System Authorization Complete", errorCode:0})
        }
        
    }
}

function executeWithAuthorization(auth, data, res, operation){

    firebase.auth()
        .signInWithEmailAndPassword(auth.username,auth.password)
        .then(e => {
            operation(data, res)
        }).catch(e => {
            res.json({message:"Permission Denied", errorCode:-1})
        })
}

////////////////////////////////// [SYSTEM AUTHORIZATION & ACTIVATION] //////////////////////////////////


//////////////////////////// [Users  Security Features] ///////////////////////////////////

function authenticateUser(object){
    
    let res = null  
    let data = object.data
    let firestore = firebase.firestore()

    if(object.res){
        res = object.res // Store the HTTP server response object 
        delete object.res
        let username = data.username.split("@")[0]

        firestore.collection("users")
            .doc(data.department)
            .collection(data.employeeId)
            .doc(username)
            .get().then(snapshot => {

               let user = null

                if(snapshot.data()){

                    user = snapshot.data()
                    if (user.password === misc.hash(data.password)){

                        let token = createUserToken(username)
                        res.json({message: "User Authenticated", errorCode: 0, authToken: token})
                    }
                    else{
                        res.json({message: "Invalid Username or Password or Deparment", errorCode: -2})
                    }

                }else{
                    firebase.auth()
                        .signInWithEmailAndPassword(data.username,data.password)
                        .then(e => {
                            let token = createUserToken(username)
                            res.json({message:"Access Granted", errorCode:0, authToken: token})
                        }).catch(e => {
                            res.json({message:"Invalid Username or Password or Deparment", errorCode:-1})
                        })
                }
        }).catch(e => {
                res.json({message: "An error has occured", errorCode: -1})
        })
    }
}

function addUser(object){
    let res = null  

    if(object.res){

        res = object.res
        delete object.res

        executeWithAuthorization(object.authorization, object.data, res, (data, res) =>{
            let department = data.department
            let employeeId = data.employeeId
            let username = data.username

            data.password = misc.hash(data.password)

            delete data.department
            delete data.username
            delete data.employeeId

            firebase.firestore().collection("users")
                .doc(department)
                .collection(employeeId)
                .doc(username)
                .set(data).then(e => {
                    res.json({message:"User Account created", errorCode:0})
            }).catch(e => {
                res.json({message:"Failed to create user account", errorCode:-1})
            })

        })
    }
}


function deleteUser(object){
    let res = null  

    if(object.res){
        res = object.res
        delete object.res

        executeWithAuthorization(object.authorization, object.data, res, (data, res) =>{
            
            firebase.firestore().collection("users")
                .doc(data.department)
                .collection(data.employeeId)
                .doc(data.username)
                .delete()

                res.json({message:"User Deleted", errorCode: 0})
        })       
    }
}

function getUser(object){
    let res = null  

    if(object.res){
        res = object.res
        delete object.res

        executeWithAuthorization(object.authorization, object.data, res, (data, res) =>{
           
            firebase.firestore().collection("users")
                .doc(data.department)
                .collection(data.employeeId)
                .doc(data.username)
                .get().then(snapshot => {

                    if(snapshot.data()){
                        let data = snapshot.data()
                        delete data.password
                        res.json({message:"Found User", errorCode:0, data: data})
                    }else{
                        res.json({message:"User Not Found", errorCode:-2})
                    }
                    
            }).catch(e => {
                res.json({message:"Error Getting User", errorCode:-1})
            })
        })
    }
}

//////////////////////////// [Users  Security Features] //////////////////////////////////
//////////////////////////// [Module Export Interface] ///////////////////////////////////

function requestHandler(req, res){
    
    let request = req.body
    try{
        request.args.res = res

        if(! executeRequest(request)){
            res.json({message: "SECMOD:Command Not Supported", errorCode: -1})
        }
    }catch(e){
        res.json({message: "SECMOD:Invalid Request", errorCode: -2})
    }
}

function executeRequest(parameters){
    return eventCore.emit(parameters.command, parameters.args)
}

function initializeModule(firebaseObject){

    firebase = firebaseObject
    eventCore.addListener("auth-user",      authenticateUser)
    eventCore.addListener("usr-activate",   activateForUser)
    eventCore.addListener("sys-activate",   activateSystem)
    eventCore.addListener("del-user",       deleteUser)
    eventCore.addListener("add-user",       addUser)
    eventCore.addListener("get-user",       getUser)
}

module.exports = {
    "init": initializeModule,
    "route": requestHandler,
    "run": executeRequest
}