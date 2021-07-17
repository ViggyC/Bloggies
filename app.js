const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const methodOverride = require('method-override')
const passport = require("passport");
const session = require("express-session");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("./middleware/auth");
const MongoStore = require("connect-mongodb-session")(session);
const connectDB = require("./config/db.js");

// Load config
dotenv.config({ path: ".env" });
//Passport config
require("./config/passport")(passport);

connectDB();

const app = express();

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Handlebar Helpers
const { formatDate, stripTags, truncate, editIcon, select} = require("./helpers/hbs");

//Handle bars
app.engine(
  ".hbs",
  exphbs({ helpers: { formatDate, stripTags, truncate , editIcon, select}, defaultLayout: "main", extname: ".hbs" })
);
app.set("view engine", ".hbs");

//Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({mongooseConnection: mongoose.connection}) *************CHeck
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global variable
app.use(function(req,res,next){
  res.locals.user = req.user || null
  next()
})

//Static Folders
app.use(express.static(path.join(__dirname, "public")));


// Routes
//app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


//First page, login page
app.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// description     Dashboard page
//route     GET/dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.firstName, //this is coming from passport.js, the logged in user
      stories
    });
  } catch (err) {
    console.log(err);
    res.render('error/500')
  }
  console.log(req.user);
});



const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running on ${process.env.NODE_ENV} on port ${PORT}`)
);
