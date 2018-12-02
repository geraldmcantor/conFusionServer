const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

// Handle requests for /leaders
leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the leaders to you!');
})
.post((req, res, next) => {
    res.end(
        'Will add the leader: ' +
        req.body.name +
        ' with details: ' +
        req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
})
.delete((req, res, next) => {
    res.end('Deleting all leaders');
});

// Setup the routing for handling /leaders/:leaderId requests
leaderRouter.route('/:leaderId')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send details of the leader: ' + req.params.leaderId +' to you!');
})
.post((req, res, next) => {
    res.end(
        'Will add the leader: ' +
        req.body.name +
        ' with details: ' +
        req.body.description +
        ' to leader with id ' +
        req.params.leaderId);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders/' + req.params.leaderId);
})
.delete((req, res, next) => {
    res.end('Deleting leader with id ' + req.params.leaderId);
});

module.exports = leaderRouter;
