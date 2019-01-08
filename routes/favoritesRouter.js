// Week 4 assignment. Drum up new router to handle opertions against
// /favorites and /favorites/dishId.
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favorites = require('../models/favorites');

var authenticate = require('../authenticate');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

// Handle requests for /favorites. Only authenticated users can peform a GET
// on this endpoint
favoritesRouter.route('/')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
         // Only get favorites owned by the caller.
         Favorites.find({
             'user': req.user._id
         })
         .populate('user')
         .populate('dishes')
         .then((favorites) => {
             res.statusCode = 200;
             res.setHeader('Content-Type', 'application/json');
             res.json(favorites);
         }, (err) => next(err))
         .catch((err) => next(err));
    })
    // Only authenticated users can post a list of dishes to /favorites
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // Determine if a favorites document already exists for this user
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (favorites) {
                    // Found a favorites document for the caller. Loop through
                    // the array of dish ids and add only those that are not
                    // already marked as favorites.
                    for (var idx = 0; idx < req.body.length; idx++) {
                        if (favorites.dishes.indexOf(req.body[idx]._id) === -1) {
                            console.log(
                                'Adding dish %s to favorites for user %s',
                                req.body[idx]._id,
                                req.user.username);
                            favorites.dishes.push(req.body[idx]._id);
                        }
                    }
                    // At this point, the favorites document has all newly
                    // added favorites. Save to DB.
                    favorites.save()
                    .then((favorites) => {
                        console.log(
                            'Updated favorites for user %s',
                            req.user.username);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err)); 
                } else {
                    // Did not find a favorites document for the caller, so
                    // drum one up.
                    Favorites.create({"user": req.user._id, "dishes": req.body})
                    .then((favorites) => {
                        console.log(
                            'Created favorites for %s',
                            req.user.username);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));  
        })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({"user": req.user._id})
        .then((resp) => {
            console.log('Removed all favorites for user %s', req.user.username);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });

favoritesRouter.route('/:dishId')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/'+ req.params.dishId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // Determine if a favorites document already exists for this user
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if (favorites) {            
                // Found a favorites document for the caller. See if the
                // supplied dishId is already in the favorites document. 
                if (favorites.dishes.indexOf(req.params.dishId) === -1) {
                    // A new dish is being added to favorites. Add to array
                    // and save to DB. 
                    favorites.dishes.push(req.params.dishId)
                    favorites.save()
                    .then((favorites) => {
                        console.log(
                            'Added dish %s to favorites for user %s',
                            req.params.dishId,
                            req.user.username);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err))
                }
            } else {
                // Did not find a favorites document for the caller, so
                // drum one up.
                Favorites.create({"user": req.user._id, "dishes": [req.params.dishId]})
                .then((favorites) => {
                    console.log(
                        'Created favorites for user %s',
                        req.user.username);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/'+ req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // Does the caller have a favorites?
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if (favorites) {            
                // Yes they do. Does the favorites document contain the supplied
                // dish?
                index = favorites.dishes.indexOf(req.params.dishId);
                if (index >= 0) {
                    // Yes it does. Remove it and save to DB.
                    favorites.dishes.splice(index, 1);
                    favorites.save()
                    .then((favorites) => {
                        console.log(
                            'Deleted dish %s from user %s favorites',
                            req.params.dishId,
                            req.user.username);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err));
                } else {
                    // No it does not, so that is error time. 
                    err =
                        new Error(
                            'Dish ' +
                            req.params.dishId +
                            ' not found on ' +
                            req.user.username +
                            ' favorites');
                    err.status = 404;
                    return next(err);
                }
            } else {
                err =
                    new Error(
                        'User ' +
                        req.user.username +
                        ' does not have a favorites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });

module.exports = favoritesRouter;
