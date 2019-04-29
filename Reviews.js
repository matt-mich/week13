var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Movie = require('./Movies');
var User = require('./Users');
var jwt = require('jsonwebtoken');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// user schema
var ReviewSchema = new Schema({
    title: { type: String, required: true},
    username: { type: String, required: true},
    jwt:{type: String, required: true},
    review: { type: String, required: true},
});

ReviewSchema.pre('save', function(next) {
    var review = this;
    console.log("Saving");

    Movie.findOne({title:review.title},function(err,movie){
        if(movie == null){
            let err = new Error('No movie found');
            return next(err);
        }else{

            const jwt_payload = review.jwt;
            jwt_user = jwt.verify(jwt_payload, process.env.SECRET_KEY);
            try {
                jwt_user = jwt.verify(jwt_payload, process.env.SECRET_KEY);
            } catch (e) {
                let err = new Error('No valid token');
                next(err);
            }
            review.jwt = "Valid";


            User.findById(jwt_user.id, function (err, user) {
                if (user) {
                    review.username = user.username;
                    next();
                } else {
                    let err = new Error('No valid token');
                    return next(err);
                }
            });
        }
    });
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema,'reviews');