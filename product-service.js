const file = require('fs');     //to use file system module
var products = [];
var categories = [];

module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/products.json', utf8, (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                products = JSON.parse(data);
            

        fs.readFile('./data/categories.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
                resolve();
            }

        });
    }
       
    });
});
}

module.exports.getAllProducts = function(){
    return new Promise((resolve,reject)=>{
        (products.length > 0 ) ? resolve(products) : reject("no results returned"); 
    });
}


//add product
module.exports.addProduct = (productData) => {
    return new Promise(function(resolve, reject){
        productData.published = (productData.published) ? true : false;
        productData.postDate = new Date().toISOString().split("T")[0]
        productData.id = products.length + 1;
        products.push(productData);

        resolve();
    })
}
module.exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if (categories.length == 0) {
            reject ('no results returned');
        }
        else {
            resolve (categories);
        }
    })
};
module.exports.getPublishedProducts = () => {
    return new Promise ((resolve, reject) => {
        var publishedProducts = products.filter(product => product.published == true);
        if (publishedProducts.length == 0) {
            reject('no results returned');
        }
        resolve(publishedProducts);
    })
};

module.exports.getProductByMinDate = (postDate) => {
    return new Promise((resolve,reject) => {
        var prod_postDate = products.filter(product => product.postDate == postDate);
        if (prod_postDate .length == 0) {
            reject('No results returned');
        }
        resolve(prod_postDate );
    })
};
module.exports.getProductByCategory = (categories) => {
    return new Promise ((resolve,reject) => {
        var prod_categories = products.filter(product=> product.categories == categories);        
        if (prod_categories.length == 0) {
            reject ('No results returned');
        }
        resolve(prod_categories);
    })
};

module.exports.getProductById = (id) => {
    return new Promise ((resolve,reject) => {
        var prod_id = products.filter(product=> product.id == id);        
        if (prod_id .length == 0) {
            reject ('No results returned');
        }
        resolve(prod_id );
    })
};
module.exports.getPublishedProductsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        
      let output = products.filter(
        (product) => product.published == true && product.category == category
      )
      
      if (!output.length) {
        console.log("nothing here")
        reject("No results returned")
        return;
      }
      
      else {
        console.log(output)
        resolve(output);
      }
    })
};