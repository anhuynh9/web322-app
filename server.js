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
const exphbs = require('express-handlebars');



app.engine('.hbs', exphbs({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }           
    } 
}));

app.set('view engine', '.hbs');
onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}
//use
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
cloudinary.config({
    cloud_name: 'dmjwltztq',
  api_key: '144454221373936',
  api_secret: 'QHQSIBLvzVpk-tbsOa9wQ7tpywc',
  secure: true
  });
app.use(function(req,res,next){
    let route = req.path.substring(1);
app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ?route.replace(/\/(?!.*)/, "") :route.replace(/\/(.*)/, ""));
app.locals.viewingCategory = req.query.category;
next();
});


app.get('/', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"));
});

//otherwise /home would return an error
app.get('/home', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"));
});
//about
app.get('/addProduct', (req, res) => {
    res.render(path.join(__dirname + "/views/addProduct.hbs"));
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
            res.render("demos", {demos: data});
        }).catch((err) => {
            res.render("demos", {message: "no results"});
        })
    }
    else if (req.query.category) {
        productservice.getProductByCategory(req.query.category).then((data) => {
            res.render("demos", {demos: data});
        }).catch((err) => {
            res.render("demos", {message: "no results"});
        })
    }
    else {
        productservice.getAllProducts().then((data) => {
        res.render("demos", {demos: data});
    }).catch((err) => {
        res.render("demos", {message: "no results"});
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
        res.render("categories", {categories: data});
    }).catch((err) => {
        res.render("categories", {message: "no results"});

    })
});
app.get('/products/:id', async (req, res) => {

    let data = {};
  
    try {
  
      let products = [];
  
      if (req.query.category) {
        products = await productService.getPublishedproductsByCategory(req.query.category);
      }
  
      else {
        products = await productService.getPublishedproducts();
      }
  
      products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
      data.products = products;
  
    } catch (err) {
      data.message = "no results";
    }
  
    try {
      data.post = await productService.getPostById(req.params.id);
    } catch (err) {
      data.message = "no results";
    }
  
    try {
  
      let categories = await productService.getCategories();
  
      data.categories = categories;
    } catch (err) {
      data.categoriesMessage = "no results"
    }
  
  
    res.render("product", { data: data })
  });

app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

productservice.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises unfulfilled');
});
