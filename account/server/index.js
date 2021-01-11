const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const secrets = require("./config/secrets");
const configurePassport = require("./config/passport");
const configureExpress = require("./config/express");
const users = require("./controllers/users");
require("./models/user");

// -------------------------------------------

const app = express()

// -------------------------------------------

const connect = () => {
	mongoose.connect(secrets.db, (err, res) => {
		if (err) {
			console.log(`Error connecting to ${secrets.db}. ${err}`)
		} else {
			console.log(`Successfully connected to ${secrets.db}.`)
		}
	})
}
connect()

mongoose.connection.on("error", console.error)
mongoose.connection.on("disconnected", connect)

// -------------------------------------------

const isDev = process.env.NODE_ENV === "development"




var backend_server = process.env['BACKEND_SERVER'] != null ? process.env['BACKEND_SERVER'] : 'https://api.openmhz.com';
var frontend_server = process.env['FRONTEND_SERVER'] != null ? process.env['FRONTEND_SERVER'] : 'https://openmhz.com';
var media_server = process.env['MEDIA_SERVER'] != null ? process.env['MEDIA_SERVER'] : 'https://media.openmhz.com'; //'https://s3.amazonaws.com/robotastic';
var socket_server = process.env['SOCKET_SERVER'] != null ? process.env['SOCKET_SERVER'] : 'wss://api.openmhz.com'; //'https://s3.amazonaws.com/robotastic';
var admin_server = process.env['ADMIN_SERVER'] != null ? process.env['ADMIN_SERVER'] : 'https://admin.openmhz.com'; //'https://s3.amazonaws.com/robotastic';
var account_server = process.env['ACCOUNT_SERVER'] != null ? process.env['ACCOUNT_SERVER'] : 'https://account.openmhz.com'; //'https://s3.amazonaws.com/robotastic';
var site_name = process.env['SITE_NAME'] != null ? process.env['SITE_NAME'] : "OpenMHz";
const proPlanValue = process.env['PRO_PLAN'] != null ? process.env['PRO_PLAN'] : 10;
const freePlanValue = process.env['FREE_PLAN'] != null ? process.env['FREE_PLAN'] : 0;
const proPlanPrice = process.env['PRO_PLAN_PRICE'] != null ? process.env['PRO_PLAN_PRICE'] : 15;
const freePlanPrice = process.env['FREE_PLAN_PRICE'] != null ? process.env['FREE_PLAN_PRICE'] : 0;


// -------------------------------------------

configurePassport(app, passport)
configureExpress(app, passport)


app.all('*', function(req, res, next) {
  	var allowedOrigins = [account_server, admin_server, frontend_server];
		var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// -------------------------------------------
app.use(express.static(path.join(__dirname, "public")));
app.post("/login", users.login)
app.get("/logout", users.logout)
app.get("/authenticated", users.authenticated)
app.post("/register", users.validateProfile, users.register)
app.post("/users/:userId/reset-password/:token", users.resetPassword)
app.post("/api/send-reset-password", users.sendResetPassword)
app.post("/users/:userId", users.isLoggedIn, users.validateProfile, users.updateProfile)
app.post("/users/:userId/terms", users.isLoggedIn, users.terms)
app.post("/users/:userId/send-confirm",  users.sendConfirmEmail)
app.post("/users/:userId/confirm/:token",  users.confirmEmail)

app.get("*", (req, res, next) => {
	res.sendFile('public/index.html');
});


// start listening to incoming requests
app.listen(app.get("port"), app.get("host"), (err) => {
	if (err) {
		console.err(err.stack)
	} else {
		console.log(`App listening on port ${app.get("port")} [${process.env.NODE_ENV} mode]`)
	}
})