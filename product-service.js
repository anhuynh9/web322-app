const fs = require("fs");

let demos = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/products.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                demos = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllDemos = function(){
    return new Promise((resolve,reject)=>{
        (demos.length > 0 ) ? resolve(demos) : reject("no results returned"); 
    });
}

module.exports.getDemosByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredDemos = demos.filter(product=>product.category == category);

        if(filteredDemos.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredDemos);
        }
    });
}

module.exports.getDemosByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredDemos = demos.filter(product => (new Date(product.postDate)) >= (new Date(minDateStr)))

        if (filteredDemos.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredDemos);
        }
    });
}

module.exports.getProductById = function(id){
    return new Promise((resolve,reject)=>{
        let foundProduct = demos.find(product => product.id == id);

        if(foundProduct){
            resolve(foundProduct);
        }else{
            reject("no result returned");
        }
    });
}

module.exports.addProduct = function(productData){
    return new Promise((resolve,reject)=>{
        productData.published = productData.published ? true : false;
        productData.id = demos.length + 1;
        let now = new Date();
        productData.postDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        demos.push(productData);
        resolve();
    });
}

module.exports.getPublishedProducts = function(){
    return new Promise((resolve,reject)=>{
        let filteredDemos = demos.filter(product => product.published);
        (filteredDemos.length > 0) ? resolve(filteredDemos) : reject("no results returned");
    });
}

module.exports.getPublishedProductsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredDemos = demos.filter(product => product.published && product.category == category);
        (filteredDemos.length > 0) ? resolve(filteredDemos) : reject("no results returned");
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}