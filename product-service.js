const file = require('fs');     //to use file system module
var products = [];
var categories = [];

exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        file.readFile('./data/products.json', (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                products = JSON.parse(data);
            }
        });

        file.readFile('./data/categories.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        })
        resolve();
    })
};

exports.getAllProducts = () => {
    return new Promise ((resolve,reject) => {
        if (products.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(products);
        }
    })
};

exports.getPublishedProducts = () => {
    return new Promise ((resolve, reject) => {
        var publishedProducts = products.filter(product => product.published == true);
        if (publishedProducts.length == 0) {
            reject('no results returned');
        }
        resolve(publishedProducts);
    })
};

exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if (categories.length == 0) {
            reject ('no results returned');
        }
        else {
            resolve (categories);
        }
    })
};

exports.addProduct = (productData) => {
    productData.published==undefined ? productData.ipublished = false : productData.published = true;
    productData.employeeNum = employees.length + 1;
    products.push(productData);

    return new Promise((resolve,reject) => {
        if (products.length == 0) {
            reject ('no results');
        }
        else {
            resolve(products);
        }
    })
};
exports.getProductByMinDate = (postDate) => {
    return new Promise((resolve,reject) => {
        var prod_postDate = products.filter(product => product.postDate == postDate);
        if (prod_postDate .length == 0) {
            reject('No results returned');
        }
        resolve(prod_postDate );
    })
};
exports.getProductByCategory = (categories) => {
    return new Promise ((resolve,reject) => {
        var prod_categories = products.filter(product=> product.categories == categories);        
        if (prod_categories.length == 0) {
            reject ('No results returned');
        }
        resolve(prod_categories);
    })
};

exports.getProductById = (id) => {
    return new Promise ((resolve,reject) => {
        var prod_id = products.filter(product=> product.id == id);        
        if (prod_id .length == 0) {
            reject ('No results returned');
        }
        resolve(prod_id );
    })
};