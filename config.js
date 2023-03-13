const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')


const serviceAccount =  require('./node-framework-e1593-firebase-adminsdk-o87h7-1739910dc3.json')

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

module.exports = { db }



