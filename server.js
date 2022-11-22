/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: An Truong Huynh Student ID: 123194219 Date: October 16 2022 *
* Online (Cyclic) Link: https://busy-red-wetsuit.cyclic.app *
* ********************************************************************************/

const express = require('express');
const productData = require("./product-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require('strip-js');
const app = express();
const HTTP_PORT = process.env.PORT || 8082;

cloudinary.config({
  cloud_name: 'dmjwltztq',
api_key: '144454221373936',
api_secret: 'QHQSIBLvzVpk-tbsOa9wQ7tpywc',
secure: true
});


const upload = multer();

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
    }
}));

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

// app.get('/', (req, res) => {
//     res.redirect("/product");
// });

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/product', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "product" objects
        let demos = [];

        // if there's a "category" query, filter the returned demos by category
        if(req.query.category){
            // Obtain the published "demos" by category
            demos = await productData.getPublishedProductsByCategory(req.query.category);
        }else{
            // Obtain the published "demos"
            demos = await productData.getPublishedProducts();
        }

        // sort the published demos by postDate
        demos.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest product from the front of the list (element 0)
        let product = demos[0]; 

        // store the "demos" and "product" data in the viewData object (to be passed to the view)
        viewData.demos = demos;
        viewData.product = product;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await productData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "product" view with all of the data (viewData)
    res.render("product", {data: viewData})

});

app.get('/demos', (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = productData.getDemosByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = productData.getDemosByMinDate(req.query.minDate);
    } else {
        queryPromise = productData.getAllDemos()
    }

    queryPromise.then(data => {
        res.render("demos", {demos: data});
    }).catch(err => {
        res.render("demos", {message: "no results"});
    })

});

app.post("/demos/add", upload.single("featureImage"), (req,res)=>{

    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processProduct(uploaded.url);
        });
    }else{
        processProduct("");
    }

    function processProduct(imageUrl){
        req.body.featureImage = imageUrl;

        productData.addProduct(req.body).then(product=>{
            res.redirect("/demos");
        }).catch(err=>{
            res.status(500).send(err);
        })
    }   
});

app.get('/demos/add', (req, res) => {
    res.render("addProduct");
});


app.get('/product/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "product" objects
        let demos = [];

        // if there's a "category" query, filter the returned demos by category
        if(req.query.category){
            // Obtain the published "demos" by category
            demos = await productData.getPublishedProductsByCategory(req.query.category);
        }else{
            // Obtain the published "demos"
            demos = await productData.getPublishedProducts();
        }

        // sort the published demos by postDate
        demos.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "demos" and "product" data in the viewData object (to be passed to the view)
        viewData.demos = demos;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the product by "id"
        viewData.product = await productData.getProductById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await productData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "product" view with all of the data (viewData)
    res.render("product", {data: viewData})
});

app.get('/categories', (req, res) => {
    productData.getCategories().then((data => {
        res.render("categories", {categories: data});
    })).catch(err => {
        res.render("categories", {message: "no results"});
    });
});

app.use((req, res) => {
    res.status(404).render("404");
})

productData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})