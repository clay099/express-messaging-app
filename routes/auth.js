const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const { updateLoginTimestamp, register } = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body.login;
		if (!username || !password) {
			throw new ExpressError("username and password required", 400);
		}
		const bool = await User.authenticate(username, password);
		if (bool) {
			User.updateLoginTimestamp(username);
			const token = jwt.sign({ username }, SECRET_KEY);
			return res.json(token);
		}
		throw new ExpressError("invalid username/password", 400);
	} catch (e) {
		return next(e);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
	try {
		const { username, password, first_name, last_name, phone } = req.body;
		const user = await register(username, password, first_name, last_name, phone);

		const token = jwt.sign({ username }, SECRET_KEY);
		return res.json(token);
	} catch (e) {
		return next(e);
	}
});
