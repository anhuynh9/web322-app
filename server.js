/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: An Truong Huynh Student ID: 123194219 Date: October 16 2022 *
* Online (Cyclic) Link: https://spring-green-coral-ring.cyclic.app/ *
* ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const fs = require('fs');
const bodyParser = require('body-parser');
const productservice = require(__dirname + "/product-service.js");



//addproduct storage
const storage = multer.diskStorage({
    destination: "./public/products/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      }
});

const upload = multer({storage: storage});

onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}
//use
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/index.html"));
});

//otherwise /index would return an error
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/index.html"));
});
//about
app.get('/addProduct', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addProduct.html"));
});

//products




app.get("/products", (req, res) => {
    if (req.query.postDate) {
        productservice.getProductByMinDate(req.query.postDate).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else if (req.query.category) {
        productservice.getProductByCategory(req.query.category).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else if (req.query.id) {
        productservice.getProductById(req.query.id).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else {
        productservice.getAllProducts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
    
    }
});

app.get('/product/:value', (req,res) => {
    productservice.getProductById(req.params.value).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
   
app.get('/products/add',(req,res) => {
    res.sendFile(path.join(__dirname + "/views/addProduct.html"));
});

app.post('/products/add', (req,res) => {
    productservice.addProduct(req.body).then(() => {
        res.redirect("/products");
    })
});
//images
app.get('/products/add',(req,res) => {
    res.sendFile(path.join(__dirname + "/views/addProduct.html"));
});

app.post("/products/add", upload.single("productFile"), (req,res) => {
    res.redirect("/products");
});

app.get("/products", (req,res) => {
    fs.readdir("./public/products/uploaded", function(err,items) {
        res.json(items);
    })
});



//demos
app.get("/demos", (req, res) => {
    productservice.getPublishedProducts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});



app.get("/categories", (req, res) => {
    productservice.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
//update
app.get('/products/add',(req,res) => {
    res.sendFile(path.join(__dirname + "/views/addProduct.html"));
});

app.post('/products/add', (req,res) => {
    productservice.addProduct(req.body).then(() => {
        res.redirect("/products");
    })
});

app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

productservice.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises unfulfilled');
});