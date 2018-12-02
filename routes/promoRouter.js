const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// Handle requests for /promotions
promoRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the promotions to you!');
})
.post((req, res, next) => {
    res.end(
        'Will add the promotion: ' +
        req.body.name +
        ' with details: ' +
        req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    res.end('Deleting all promotions');
});

// Setup the routing for handling /promotions/:promoId requests
promoRouter.route('/:promoId')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send details of the promotions: ' + req.params.promoId +' to you!');
})
.post((req, res, next) => {
    res.end(
        'Will add the promotion: ' +
        req.body.name +
        ' with details: ' +
        req.body.description +
        ' to promotion with id ' +
        req.params.promoId);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions/' + req.params.promoId);
})
.delete((req, res, next) => {
    res.end('Deleting promotion with id ' + req.params.promoId);
});

module.exports = promoRouter;
