const crypto = require("crypto")
const HASH_ALGORITHM = "sha256"

function timestamp(){
    let date = new Date()
    return Math.floor(date)
}

function token(){
    let randomNumber = Math.random().toString()
    let hash = crypto.createHash(HASH_ALGORITHM).update(randomNumber).digest("hex")
    return hash
}

function hash(data){
    let hash = crypto.createHash(HASH_ALGORITHM).update(data).digest("hex")
    return hash
}


module.exports = {
    "timestamp" : timestamp,
    "token" : token,
    "hash" : hash
}