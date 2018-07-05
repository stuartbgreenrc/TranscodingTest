"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
var express = require("express");
var router = express.Router();
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});
router.get('/test', function (req, res) {
    res.render('test', { title: 'TEST STREAMING' });
});
exports.default = router;
//# sourceMappingURL=index.js.map