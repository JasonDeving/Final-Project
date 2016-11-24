var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware/');
// Get /login
router.get('/login', mid.loggedOut,function(req, res, next){
	return res.render('login', { title: 'login' });
});
// Get /logout
router.get('/logout', function(req, res, next){
	if (req.session) {
		//delete session
		req.session.destroy((err)=>{
			if(err) {
				return next(err)
			} else {
				return res.redirect('/');
			}
		});
	}
});
// POST /login
router.post('/login', function(req, res, next){
	var body = req.body;
	if(body.email && body.password){
		User.authenticate(body.email, body.password, function(error, user) {
			if(error || !user) {
				var err = new Error('wrong email or password');
				err.status = 401;
				next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('/profile');
			}
		});
	} else {
		var err = new Error('Email and password are required');
		err.status = 401;
		return next(err);
	}
});

// GET /profile
router.get('/profile', mid.requiresLogin,function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

// GET /register
router.get('/register', mid.loggedOut,function(req, res, next){
	return res.render('register', { title: 'Sign up' });
});
// POST /register
router.post('/register', function(req, res, next){
	var body = req.body;
	if (body.email && 
	   body.name &&
	   body.favoriteBook &&
	   body.password &&
	   body.confirmPassword) {
	   // password check
	   if (body.password !== body.confirmPassword) {
	   	var err = new Error('Passwords do not match');
	   	err.status = 400;
	   	return next(err);
	   }
	   // create object with form input
	   var userData = {
	   	email: body.email,
	   	name: body.name,
	   	favoriteBook: body.favoriteBook,
	   	password: body.password
	   };
	   // use schema to create to method to insert into database
	   User.create(userData, function(error, user) {
	   	if (error) {
	   		return next(error);
	   	} else {
	   		req.session.userId = user._id;
	   		return res.redirect('/profile');
	   	}
	   });
	} else {
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
