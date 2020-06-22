'use strict'

const fs = require('fs');

module.exports = (app) => {
    // index all routes from 'routes' directory
    fs.readdir(__dirname, function (err, files) {
        if (err)
            throw err;
        files.forEach(function (file) {
            const router = require(path.join(__dirname, file));
            app.use(router);
            if (process.env.DEBUG)
                console.log(file + " route has been loaded.");
        });
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next({code: 404, message: 'Not found.'});
    });

    // error handling
    app.use(function (err, req, res, _next) {
        try {
            return res.status(err.code ? err.code : 500).json({
                success: false,
                message: err.message ? err.message : 'Internal Server Error'
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    });
}
