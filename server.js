const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const User = require('./models/User')
const methodOverride = require('method-override');
const initializePassport = require("./config/passport");
const app = express();


app.use(methodOverride('_method'))
app.use(passport.initialize());
//Passport Initialization
initializePassport(passport)

app.use(cors());
app.options(cors());
app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({ extended: false ,limit: '200mb'}));

//Loading the config file
dotenv.config({ path: "./config/config.env" });





//Database connection
connectDB();

//Logging requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}



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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
