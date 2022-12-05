/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: An Truong Huynh Student ID: 123194219 Date: October 16 2022 *
* Online (Cyclic) Link: https://busy-red-wetsuit.cyclic.app/blog *
* ********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const path = require('path');
const productData = require(path.join(__dirname, 'product-service.js'));
const authData = require("./auth-service.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require('express-handlebars');
const stripjs = require('strip-js');
const clientSessions = require("client-sessions");




cloudinary.config({
  cloud_name: 'dmjwltztq',
api_key: '144454221373936',
api_secret: 'QHQSIBLvzVpk-tbsOa9wQ7tpywc',
secure: true
});



app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_Assignemnt06",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
      res.redirect("/login");
  } else {
      next();
  }
}
const upload = multer();

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: "main",
  helpers: {
      navLink: function (url, options) {
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
      }
  }
}));

app.set("view engine", ".hbs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));



app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


app.get("/", (req, res) => {
  res.redirect("/product");
});



app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/product", async (req, res) => {
 let viewData = {};

  try {
   let products = [];

   if (req.query.category) {
      products = await productData.getPublishedProductsByCategory(
        req.query.category
      );
    } else {
      products = await productData.getPublishedProducts();
    }

    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let product = products[0];

    viewData.products = products;
    viewData.product = product;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await productData.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("product", { data: viewData });
});

//get demos - add ensureLogin
app.get("/demos", ensureLogin, (req, res) => {
  if (req.query.category) {
    productData
      .getPublishedProductsByCategory(req.query.category)
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        res.render("demos", { products: data });
      })
      .catch(() => {
        res.render("demos", { message: "no results" });
      });
  } else if (req.query.minDate) {
    productData
      .getProductByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        res.render("demos", { products: data });
      })
      .catch(() => {
        res.render("demos", { message: "no results" });
      });
  } else {
    productData
      .getAllProducts()
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        console.log("this is demnos rendering");
        res.render("demos", { products: data });
      })
      .catch(() => res.render("demos", { message: "no results" }));
  }
});


app.get("/demos/delete/:id", ensureLogin, (req, res) => {
  productData
    .deleteProductById(req.params.id)
    .then(() => {
      res.redirect("/demos");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Post / Post Not Found");
    });
});

app.get("/demos/:id", ensureLogin, (req, res) => {
  productData
    .getProductById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});


app.get("/categories", ensureLogin, (req, res) => {
  productData
    .getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
  productData
    .addCategory(req.body)
    .then((category) => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  productData
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category Not Found");
    });
});

app.get("/products/add", ensureLogin, (req, res) => {
  productData
  .getCategories()
  .then((data) => {
    res.render("addProduct", { categories: data });
  })
  .catch((err) => {
    res.render("addProduct", { categories: [] });
  });
});

app.post("/products/add", ensureLogin, upload.single("featureImage"), (req, res) => {
  if (req.file) {
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
      processProducts(uploaded.url);
    });
  } else {
    processProducts("");
  }

  function processProducts(imageUrl) {
    req.body.featureImage = imageUrl;

    productData
      .addProduct(req.body)
      .then(() => {
        console.log("rendering products pages")
        res.redirect("/product");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

app.get("/product/:id", ensureLogin, async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "product" objects
    let products = [];

    // if there's a "category" query, filter the returned demos by category
    if (req.query.category) {
      // Obtain the published "demos" by category
      products = await productData.getPublishedProductsByCategory(
        req.query.category
      );
    } else {
      // Obtain the published "demos"
      products = await productData.getPublishedProducts();
    }

    // sort the published demos by postDate
    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "demos" and "product" data in the viewData object (to be passed to the view)
    viewData.products = products;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the product by "id"
    viewData.product = await productData.getProductById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await productData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "product" view with all of the data (viewData)
  res.render("product", { data: viewData });
});


//GET/login
app.get('/login', (req, res) => {
	res.render('login')
})

//GET/register
app.get('/register', (req, res) => {
	res.render('register')
})

//POST/register
app.post('/register', (req, res) => {
	authData
		.RegisterUser(req.body)
		.then(() => {
			res.render('register', { successMessage: 'User created' })
		})
		.catch((err) => {
			res.render('register', { errorMessage: err, userName: req.body.userName })
		})
})
//POST/login
app.post('/login', (req, res) => {
	req.body.userAgent = req.get('User-Agent');
	authData
		.checkUser(req.body)
		.then((user) => {
			req.session.user = {
				userName: user.userName,// authenticated user's userName
				email: user.email, // authenticated user's email
				loginHistory: user.loginHistory// authenticated user's loginHistory
			}
		
			res.redirect('/demos');
		})
		.catch((err) => {
			res.render('login', { errorMessage: err, userName: req.body.userName })
		})
})
//GET/logout
app.get('/logout', (req, res) => {
	req.session.reset();
	res.redirect('/');
})
//GET/userHistory
app.get('/userHistory', ensureLogin, (req, res) => {
	res.render('userHistory')
})

app.use((req, res) => {
  res.status(404).render("404");
});

productData.initialize().then(authData.initialize).then(function () {
  app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
  });
}).catch(function (err) {
  console.log("unable to start server: " + err);
});