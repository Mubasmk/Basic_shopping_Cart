var db = require('../config/connection');
var collection = require('../config/collections');
const { resolve, reject } = require('promise');
const { response } = require('express');
var objectId = require('mongodb').ObjectID;

module.exports = {
    addProduct: (product, callback) => {
        product.Price = parseInt(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        });
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            });
        });
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            });
        });
    },
    updateProduct: (proId, proDetails) => {
        proDetails.Price = parseInt(proDetails.Price);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $set: {
                        Name: proDetails.Name,
                        Category: proDetails.Category,
                        Price: proDetails.Price,
                        Description: proDetails.Description
                    }
                }).then((response) => {
                    resolve();
                });
        });
    },
    adminLogin: (adminData) => {
        let myData = {
            Password: '123',
            Email: 'admin@123',
            Name: 'adminBro'
        }
        return new Promise((resolve, reject) => {
            let response = {}
            let status = false

            console.log("adm", adminData.Email);

            if (myData.Email == adminData.Email && myData.Password == adminData.Password) {
                console.log("login success");
                response.status = true
                response.myData = myData
                resolve(response)
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        });
    },
    getAllUser:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        });
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        })
    }
}