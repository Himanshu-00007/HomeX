const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const User = require("../models/user.js"); 
const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => { // Added 'next'
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email }); 
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
});

router.get("/logout", (req, res, next) => { // Added 'next'
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;
