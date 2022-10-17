/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: An Truong Huynh Student ID: 123194219 Date: October 16 2022 *
* Online (Cyclic) Link: https://busy-red-wetsuit.cyclic.app/ *
* ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const fs = require('fs');
const bodyParser = require('body-parser');
const streamifier = require("streamifier");
const { get } = require("http");
const upload = multer();
const productservice = require(__dirname + "/product-service.js");





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

//add image cloudinary code
app.post("/products/add", upload.single("featureImage"), function (req, res) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
  
    upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
    });
  
    // TODO: Process the req.body and add it as a new Product Demo before redirecting to /demos
    productSrv.addProduct(req.body).then(() => {
      res.redirect("/demos"); //after done redirect to demos
    });
  });


//products




app.get("/demos", (req, res) => {
    if (req.query.minDate) {
        productservice.getProductByMinDate(req.query.minDate).then((data) => {
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
   


app.get("/categories", (req, res) => {
    productservice.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
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
