var express = require('express');
var router = express.Router();
 var queryAllRequests= require('./call_functions/350/queryAllRequests');
 var queryRequest= require('./call_functions/350/queryRequest');
 var deleteRequest= require('./call_functions/350/deleteRequest');
 var enrollAdmin = require('./call_functions/enrollAdmin');
 var createNotification= require('./call_functions/350/createNotification');
 var changeOwnerShip= require('./call_functions/350/changeOwnerShip');
 var changeUserNR= require('./call_functions/350/changeUserNR');
 var getHistoryofAsset= require('./call_functions/350/getHistoryofAsset');
 var queryAsset= require('./call_functions/350/queryAsset');
 var createAsset= require('./call_functions/350/createAsset');
 var createLoanNotification = require('./call_functions/350/createLoanNotification');
 var changeLoanStatus = require('./call_functions/350/changeLoanStatus');
 var DeedStatusRegistered = require('./call_functions/350/DeedStatusRegistered');
 var DeedStatusUnregistered = require('./call_functions/350/DeedStatusUnregistered');
 const PDFDocument = require('pdfkit');
//multer related to image uploadling
const multer = require('multer');
/////////////Image Uploading prerequisite////////////////
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/asset/locations');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
///////////////////////////

 //////////
//unique keys//
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

 ///////

router.get('/',async function(req, res, next) {
  if(req.session.admin)res.redirect('/bank/requests');
  else{
  enrollAdmin();
    res.render('BankLogin' , {title: "Bank Login" ,  error: req.session.error, AdminPage: true});
    req.session.error = false;
  }
  });
  router.post('/loginAsBank',async function(req, res, next) {

    if(req.body.password == "123"){
      req.session.admin = true;
      res.redirect('/bank/requests');
      
    }
    else{
      req.session.error = true;
      res.redirect('/bank');  
    }
  });
  router.get('/requests',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/bank');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('BankPanel' , {title: "Bank Panel" ,  Bank: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  } 
  });
  router.get('/challan',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/bank');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('ChallanVerification' , {title: "Bank Panel" ,  Bank: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  } 
  });

  router.get('/ViewChallanRequest/:key',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/bank');
    else{
    var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    //notification fetching
    res.render('ViewChallanRequest' , {title:  req.params.key, key: req.params.key , obj: obj, result: result , Bank: req.session.admin , AdminPage: true});
    }
  });

  router.get('/acceptRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
  
    await DeedStatusRegistered("admin",obj.AssetCode);
    await deleteRequest("admin",req.params.key);
    req.session.success = "accepted";
     res.redirect('/admin/requests');
  }
  });

  router.get('/rejectRequest/:key', async function(req, res, next) {
    //Authentication
    var result = await queryRequest(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
  
    //Authentication!
    if(req.session.admin == null)res.redirect('/admin');
    else{
    await DeedStatusUnregistered("admin",obj.AssetCode);
    await deleteRequest(req.session.NID,req.params.key);
    req.session.success = "rejected";
     res.redirect('/request/ReceivedRequests');
    }
  });

  router.get('/acceptLoanRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    
    await changeUserNR(obj.OwnerCNIC,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");
    await changeLoanStatus(req.session.NID,req.params.key);
    await createLoanNotification("admin",makeid(5),obj.AssetCode,obj.OwnerCNIC,obj.OwnerName,"","",new Date().toString(),"Accepted","","")
    await deleteRequest("admin",req.params.key);
    req.session.success = "accepted";
    res.redirect('/bank/requests');
  }
  });
  router.get('/rejectLoanRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    
    await changeUserNR(obj.OwnerCNIC,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");
    await createLoanNotification("admin",makeid(5),obj.AssetCode,obj.OwnerCNIC,obj.OwnerName,"","",new Date().toString(),"Rejected","","")
    await deleteRequest("admin",req.params.key);
    req.session.success = "rejected";
    res.redirect('/bank/requests');
  }
  });

  router.get('/logout',async function(req, res, next) {
    req.session.admin = null;
    res.redirect('/bank');
    
  });

  module.exports = router;
