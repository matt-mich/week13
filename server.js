var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var jwt = require('jsonwebtoken');

var app = express();
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);
            // return that user
            res.json(user);
        });
    });

router.route('/review')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.review || !req.body.title) {
            res.json({success: false, message: 'Please pass title, and review.'});
        }
        var review = new Review();
        review.username = "NULL";
        review.title = req.body.title;
        review.review = req.body.review;
        review.jwt = req.headers.authorization.substring(4);

        review.save(function(err) {
            if (err){
                res.send(err);
            }else{
                // return that review
                res.json(review);
            }
        });
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.username) {
            res.json({success: false, message: 'Please pass the username of the user you wish to view reviews from.'});
        }

        Review.find({username:req.body.username},function (err, reviews) {
            if (err) res.send(err);
            // return the users
            res.json(reviews);

        });
    });


router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.year || !req.body.genre || !req.body.actor_1 || !req.body.actor_2 || !req.body.actor_3 || !req.body.character_1|| !req.body.character_2|| !req.body.character_3){
            res.json({success: false, message: 'Please submit Title, year, genre, and three actor/character combinations.'});
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = [[req.body.actor_1,req.body.character_1],[req.body.actor_2,req.body.character_2],[req.body.actor_3,req.body.character_3]];

            // save the user
            movie.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code === 11000)
                        return res.json({success: false, message: 'A movie with that title already exists. '});
                    else
                        return res.send(err);
                }

                res.json({success: true, message: 'Movie created!'});
            });
        }
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title){
            res.json({success: false, message: 'Please submit title of the movie you wish to update.'});
        } else {
            var title = req.body.title;
            Movie.findOne({title:title},function(err,movie){
                if(movie != null){
                    if (err) res.send(err);

                    if(req.body.year){
                        movie.year = req.body.year;
                    }

                    if(req.body.genre){
                        movie.genre = req.body.genre;
                    }

                    if(req.body.actor_1){
                        movie.actors[0][0] = req.body.actor_1;
                    }
                    if(req.body.actor_2){
                        movie.actors[1][0] = req.body.actor_2;
                    }
                    if(req.body.actor_3){
                        movie.actors[2][0] = req.body.actor_3;
                    }
                    if(req.body.character_1){
                        movie.actors[0][1] = req.body.character_1;
                    }
                    if(req.body.character_2){
                        movie.actors[1][1] = req.body.character_2;
                    }
                    if(req.body.character_3){
                        movie.actors[2][1] = req.body.character_3;
                    }

                    movie.save(function(err){
                        if (err) res.send(err);
                        res.json({success: true, message: 'Movie updated!'});
                    });
                }else{
                    res.json({success: false, message: 'Failed to find movie!'});
                }
            });
        }
    })

    .delete(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title){
            res.json({success: false, message: 'Please submit title of the movie you wish to delete.'});
        } else {

            var title = req.body.title;
            Movie.remove({title:title}, function(err, movie) {
                if (err) res.send(err);
                res.json({success: true, message: 'Movie deleted!'});
            });
        }
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title){
            res.json({success: false, message: 'Please submit title of the movie you wish to find.'});
        } else {
            var title_query = req.body.title;
            var reviews_json = {};
            Movie.findOne({title:title_query}, function (err, movie) {
                if (err) res.send(err);
                if(req.body.reviews && req.body.reviews === 'true'){
                    Review.find({title:req.body.title},function (err, reviews) {
                        if(Array.isArray(reviews)){
                            reviews_json = [];
                            reviews.forEach(function(review) {
                                reviews_json.push([review.username,review.review]);
                            });
                        }else{
                            reviews_json = [reviews.username,review.title];
                        }
                        console.log(reviews);
                        res.json({success: true, message: {movie,reviews_json}});
                    });
                }else{
                    res.json({success: true, message: movie});

                }
            });
        }
    });


router.post('/signin', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please submit username and password'});
    }else{
        var userNew = new User();
        userNew.name = "null";
        userNew.username = req.body.username;
        userNew.password = req.body.password;

        User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
            if (err) res.send(err);

            user.comparePassword(userNew.password, function(isMatch){
                if (isMatch) {
                    var userToken = {id: user._id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, message: 'Authentication failed.'});
                }
            });
        });
    }
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
