if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const review = require("./models/review.js");
const { listingschema, reviewschema } = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

// MongoDB Connection
const dburl = process.env.ATLASDB_URL || "mongodb://localhost:27017/yourdbname";

async function main() {
  try {
    await mongoose.connect(dburl);
    console.log("✅ DB is connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

main();

// Session & Authentication
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Ensure SECRET exists
const secret = process.env.SECRET || "fallbacksecret";

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: secret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("❌ ERROR IN MONGO SESSION STORE:", err);
});

const sessionOptions = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash messages & user info
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.get("/", async (req, res) => {
  try {
      const alllistings = await listing.find({}); // Fetch all listings
      res.render("listings/index", { alllistings }); // Pass 'alllistings' instead of 'listings'
  } catch (err) {
      console.error("Error fetching listings:", err);
      res.status(500).send("Internal Server Error");
  }
});


// 404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

// Start Server (Fix: Use `process.env.PORT`)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at port ${PORT}`);
});
