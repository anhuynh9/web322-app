const express = require("express");
const fs = require('fs');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const bodyParser = require('body-parser');
const productService = require('./product-service');

productService.getAllProducts()
    .then((data) => {
        products = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

productService.getCategories()
    .then((data) => {
        categories = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

productService.getCategories()
    .then((data) => {
        categories = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();

app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: "dmjwltztq",
    api_key: "144454221373936",
    api_secret: "QHQSIBLvzVpk-tbsOa9wQ7tpywc",
    secure: true
});

const upload = multer();

app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/products', function (req, res) {
    let publishedProducts = products.filter(ele => {
        return ele.published;
    })
    res.status(200).send(publishedProducts);
});

app.get('/product/:id', function (req, res) {
    let idProduct = products.find(ele => ele.id === parseInt(req.params.id))
    res.status(200).send(idProduct);
});

app.get('/demos', function (req, res) {
    if (req.query.category) {
        const filterProducts = products.filter(eachProduct => eachProduct.category === parseInt(req.query.category));
        res.status(200).json(filterProducts);
    }
    else if (req.query.minDate) {
        const filterProducts = products.filter(eachProduct => {
            var d1 = new Date(eachProduct.date);
            var d2 = new Date(req.query.minDate);
            if (d1 >= d2) return true
            else return false
        });
        res.status(200).json(filterProducts);
    }
    else
        res.status(200).json(products);
});

app.get('/categories', function (req, res) {
    res.status(200).json(categories);
});

app.get('/products/add', function (req, res) {
    res.sendFile('addProduct.html', { root: __dirname + '/views' });
});

app.post('/products/add', upload.single('featureImage'), function (req, res) {
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
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Product Demo before redirecting to /demos
        let product = {
            id: products.length + 1,
            ...req.body,
            postDate: new Date,
            featureImage: uploaded.url,
            published: req.body.published === 'on' ? true : false,
        }
        products.push(product);

        res.redirect('/demos');
    });

})

app.get('*', function (req, res) {
    res.status(404).send("Page Not Found");
});

productService.initialize()
    .then(() => {
        app.listen(process.env.PORT || 8080, function () {
            console.log("Express http server listening on 8080");
        });
    })
    .catch(err => {
        console.log(err);
    })