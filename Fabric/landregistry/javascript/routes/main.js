var express = require('express');
var router = express.Router();
var enrollAdmin = require('./call_functions/enrollAdmin');
router.get('/', function(req, res, next) {
    if(req.session.NID) res.redirect('/user/profile');
    else{
        enrollAdmin();
    var obj = {success: req.session.success, error: req.session.error, title: 'Patwarkhana Login'};
    //var obj = { title: '350 Login' , Array:['First Element',2,3] , check: req.session.flag , obj1:{t:1} };
    req.session.success = false;
    req.session.error = false;
     res.render('index1', obj);
    }
  });
  module.exports = router;