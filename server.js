const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const methodOverride = require('method-override');
const initializePassport = require("./config/passport");
const app = express();


app.use(methodOverride('_method'))
app.use(passport.initialize());
//Passport Initialization
initializePassport(passport)

app.use(cors());
app.options(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Loading the config file 
dotenv.config({ path: "./config/config.env" });





//Database connection
connectDB();

//Logging requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//sessions middleware. This needs to be above the passport middleware
/*app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, //means do not save until something is stored
    //cookie: { secure: true }
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
  })
);*/


//Routes
app.use("/api", require("./routes/index"));
app.use('/api/auth/password', require('./routes/password'))
app.use("/api/profile", require("./routes/profile"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/course"));
app.use("/api/modules", require("./routes/module"));


const PORT = process.env.PORT || 8000;

app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
);
