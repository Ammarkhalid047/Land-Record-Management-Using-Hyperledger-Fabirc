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
 var createFardNotification = require('./call_functions/350/createFardNotification');
 var queryAllUsers = require('./call_functions/350/queryAllUsers');
 var queryUser = require('./call_functions/350/queryUser');
 var changeRegistrarAck = require('./call_functions/350/changeRegistrarAck');
 var changeAccountStatus = require('./call_functions/350/changeAccountStatus');
 var changeBankAck = require('./call_functions/350/changeBankAck');
 var DeedStatusUnregistered = require('./call_functions/350/DeedStatusUnregistered');

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
  if(req.session.admin)res.redirect('/admin/requests');
  else{
  enrollAdmin();
    res.render('AdminLogin' , {title: "Registrar Login" ,  error: req.session.error, AdminPage: true});
    req.session.error = false;
  }
  });
  router.post('/loginAsAdmin',async function(req, res, next) {

    if(req.body.password == "123"){
      req.session.admin = true;
      res.redirect('/admin/requests');
      
    }
    else{
      req.session.error = true;
      res.redirect('/admin');  
    }
  });
  router.get('/requests',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('AdminPanel' , {title: "Admin Panel" ,  Admin: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  }
  });

  router.get('/Accountrequests',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryAllUsers("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('AccountRequests' , {title: "Admin Panel" ,  Admin: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  }
  });


  router.get('/Fardrequests',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('FardRequests' , {title: "Admin Panel" ,  Admin: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  }
  });

  router.get('/DeedRegistration',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('DeedRegistration' , {title: "Admin Panel" ,  Admin: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  }
  });

  
  router.get('/GenerateChallan/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    await changeRegistrarAck("admin",req.params.key);
    await changeBankAck("admin",req.params.key);
    req.session.success = "accepted";
     res.redirect('/admin/DeedRegistration');
  }
  });
  


  router.get('/ViewRequest/:key',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    res.render('ViewRequest' , {title:  req.params.key, key: req.params.key , obj: obj, result: result , Admin: req.session.admin , AdminPage: true});
  }
  });

  router.get('/ViewAccountRequests/:key',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryUser(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    res.render('ViewAccountRequests' , {title:  req.params.key, key: req.params.key , obj: obj, result: result , Admin: req.session.admin , AdminPage: true});
  }
  });



  router.get('/logout',async function(req, res, next) {
    req.session.admin = null;
    res.redirect('/admin');
    
  });

  router.get('/rejectRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);

    await changeUserNR(obj.OwnerNID,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");

    await createNotification("admin",makeid(5),obj.AssetCode,"","","","",new Date().toString(),"Rejected",obj.OwnerCNIC,obj.RequestedByNID)
    await deleteRequest("admin",req.params.key);
    req.session.success = "rejected";
     res.redirect('/admin/requests');
  }
  });

  router.get('/acceptAccountRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    await changeAccountStatus(req.params.key,"yes");
    req.session.success = "accepted";
     res.redirect('/admin/AccountRequests');
  }
  });

  router.get('/rejectAccountRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    await changeAccountStatus(req.params.key,"Rejected");
    req.session.success = "rejected";
     res.redirect('/admin/AccountRequests');
  }
  });


  router.get('/acceptRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);

    await changeUserNR(obj.OwnerCNIC,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");
    
    await createNotification("admin",makeid(5),obj.AssetCode,obj.OwnerCNIC,obj.OwnerName,obj.RequestedByNID,obj.RequestedByName,new Date().toString(),"Accepted","","")
    await DeedStatusUnregistered("admin",obj.AssetCode);
    await changeOwnerShip("admin",obj.AssetCode,obj.RequestedByName,obj.RequestedByNID);
    await deleteRequest("admin",req.params.key);
    req.session.success = "accepted";
     res.redirect('/admin/requests');
  }
  });

  router.get('/acceptFardRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    var asset = await queryAsset(obj.AssetCode, 'admin')
    var assets;
    assets = JSON.parse(asset);
    await changeUserNR(obj.OwnerCNIC,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");
    
    await createFardNotification("admin",makeid(5),obj.AssetCode,assets.LocationImage,"1",obj.OwnerName,new Date().toString(),"Accepted",obj.RequestedByName,"",obj.RequestedByNID,"","")
    await deleteRequest("admin",req.params.key);
    req.session.success = "accepted";
     res.redirect('/admin/FardRequests');
  }
  });



  router.get('/uploadpage',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{
    //notification fetching
    //
    res.render('UploadAsset' , {title: "Upload Asset" , success: req.session.success, error: req.session.error , Admin: req.session.admin, AdminPage:true });
    req.session.success = false;
    req.session.error = false;
    }
  });
  router.post('/upload',upload.single('assetLocation'),async function(req, res, next) {
    var assetcode = req.body.District+req.body.Tehsil+req.body.Khata_No+req.body.Khasra_No+req.body.Family_No;
    
    var result = await queryAsset(assetcode , "admin");
    if(result == ""){
    var path = req.file.path.substring(13);
    req.session.success = true;
    await createAsset(req.body.assetname, assetcode , path , req.body.CNIC , req.body.Owner , new Date().toString()
    ,req.body.District,req.body.Tehsil,req.body.Khata_No,req.body.Khasra_No,req.body.Family_No,req.body.Father_Name, req.body.Latitude, req.body.Longitude,
    req.body.Stay, req.body.Mortgage, req.body.Lease);
    }
    else{
      req.session.error = true;
    }
    res.redirect('/admin/uploadpage');
  });


  router.get('/searchPage', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{
    res.render('SearchPage' , {title:  "Search Asset", error: req.session.error
   , Admin: req.session.admin , AdminPage: true});
    req.session.error = false;
    }
  });
  
  router.post('/searchAsset',async function(req, res, next) {
    var obj,obj1;
    var result = await queryAsset(req.body.code , 'admin');
    var history = await getHistoryofAsset(req.body.code , 'admin');
    if(result == "" && history == "[]"){
      req.session.error = true;
      res.redirect('/admin/searchPage');
    }
    else{
      if(result != "")
      obj = JSON.parse(result);
      obj1 = JSON.parse(history);
    //
      res.render('History' , {title:  "Asset History of "+req.body.code, key:req.body.code, obj: obj , 
       obj1: obj1 , result: result , Admin: req.session.admin , AdminPage: true});
    }
  });
  



 
  

  module.exports = router;
