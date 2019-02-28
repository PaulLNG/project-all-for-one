const express = require('express');
var db = require('./models/index');
const User = db.sequelize.import(__dirname + "/models/user");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');




exports.register = function(req , res) {
	var newUser = new User(req.body);
	  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
	  newUser.save(function(err, user) {
	    if (err) {
	      return res.status(400).send({
	        message: err
	      });
	    } else {
	      user.hash_password = undefined;
	      return res.json(user);
	    }
	  });
}

exports.sign_in = function(req , res) {
	
}

exports.loginRequired = function(req , res , next) {
	
}