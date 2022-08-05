var express = require('express');
var router = express.Router();
var createRequest= require('./call_functions/350/createRequest');
var queryAllRequests= require('./call_functions/350/queryAllRequests');
var queryAsset= require('./call_functions/350/queryAsset');
var Advertise= require('./call_functions/350/Advertise');
var queryRequest= require('./call_functions/350/queryRequest');
var deleteRequest= require('./call_functions/350/deleteRequest');
var changeOwnerAck= require('./call_functions/350/changeOwnerAck');
var changeUserNR= require('./call_functions/350/changeUserNR');
var queryUser = require('./call_functions/350/queryUser');
var createFardRequest = require('./call_functions/350/createFardRequest');
var createFardNotification = require('./call_functions/350/createFardNotification');
var createLoanRequest = require('./call_functions/350/createLoanRequest');
var changeLoanStatus = require('./call_functions/350/changeLoanStatus');
var createDeedRequest = require('./call_functions/350/DeedRequest');
var DeedStatus = require('./call_functions/350/DeedStatus');
//////////////////

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.get('/myRequests',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAllRequests(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  await changeUserNR(req.session.NID,"ZeroS");
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('myRequests' , {title: "Sent Requests" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result, success: req.session.success
,notifications:notifications});
  req.session.success = false;
}
});

router.get('/ReceivedRequests',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAllRequests(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  await changeUserNR(req.session.NID,"ZeroR");
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ReceivedRequests' , {title: "Received Requests" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result
  ,notifications:notifications, success: req.session.success});
  req.session.success = false;
}
});

router.get('/createFardsRequest/:key',async function(req, res, next) { // this key is asset's key
  if(req.session.NID == null)res.redirect('/user');
    else{
    var result = await queryAsset(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
  
    //notifications
    await changeUserNR(req.session.NID,"IncreaseS");
    await changeUserNR(obj.OwnerCNIC,"IncreaseR");
  
    await createFardRequest(obj.OwnerCNIC,"1",obj.OwnerName,req.session.NID,req.session.USERNAME,obj.AssetName,req.params.key ,  new Date().toString());
    req.session.success = true;
    res.redirect('/asset/ads');
    }
  });

router.get('/getFard/:key' ,async function(req,res, next){
  if(req.session.NID == null)res.redirect('/user');
  else{
    var asset = await queryAsset(req.params.key, 'admin')
    var assets;
    assets = JSON.parse(asset);
    await createFardNotification("admin",makeid(5),req.params.key,assets.LocationImage,"1",assets.OwnerName,new Date().toString(),"Accepted",assets.OwnerName,"",assets.OwnerCNIC,"","")
    req.session.success = true;
    res.redirect('/notification/ViewFard');

  }
})

router.get('/createLoanRequest/:key',async function(req, res, next) { // this key is asset's key
  if(req.session.NID == null)res.redirect('/user');
    else{
    var result = await queryAsset(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
    //await Advertise(req.session.NID,req.params.key);
  
    //notifications
    await changeUserNR(req.session.NID,"IncreaseS");
    await changeUserNR(obj.OwnerCNIC,"IncreaseR");
    await changeLoanStatus(req.session.NID,req.params.key);
    await createLoanRequest(obj.OwnerCNIC,"2",obj.OwnerName,req.session.NID,req.session.USERNAME,obj.AssetName,req.params.key ,  new Date().toString());
    req.session.success = true;
    res.redirect('/asset/Loan');
    }
  });

router.get('/createRequest/:key',async function(req, res, next) { // this key is asset's key
if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAsset(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  //await Advertise(req.session.NID,req.params.key);

  //notifications
  await changeUserNR(req.session.NID,"IncreaseS");
  await changeUserNR(obj.OwnerCNIC,"IncreaseR");

  await createRequest(obj.OwnerCNIC,"0",obj.OwnerName,req.session.NID,req.session.USERNAME,obj.AssetName,req.params.key ,  new Date().toString());
  req.session.success = true;
  res.redirect('/asset/ads');
  }
});

router.get('/DeedRegistration/:key',async function(req, res, next) { // this key is asset's key
  if(req.session.NID == null)res.redirect('/user');
    else{
    var result = await queryAsset(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
    //await Advertise(req.session.NID,req.params.key);
    
    await createDeedRequest(obj.OwnerCNIC,"3",obj.OwnerName,req.session.NID,req.session.USERNAME,obj.AssetName,req.params.key ,  new Date().toString());
    await DeedStatus(req.session.NID,req.params.key);
     //notifications
     await changeUserNR(req.session.NID,"IncreaseS");
     await changeUserNR(obj.OwnerCNIC,"IncreaseR");
    req.session.success = true;
    res.redirect('/asset');
    }
  });

  const PDFDocument =  require('pdfkit');

  router.get('/generatePDF/:key', async function(req, res, next) {
    if(req.session.NID == null)res.redirect('/user');
    else{
    var result = await queryAsset(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
    
  var myDoc = new PDFDocument({bufferPages: true});
  
  let buffers = [];
  myDoc.on('data', buffers.push.bind(buffers));
  myDoc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
      'Content-Length': Buffer.byteLength(pdfData),
      'Content-Type': 'application/pdf',
      'Content-disposition': 'attachment;filename='+obj.AssetCode+'.pdf',})
      .end(pdfData);
      
  });
  
  myDoc.font('Times-Roman')
       .fontSize(12)
       .text(`this is a test text`);
  myDoc.end();
}
  });
  router.get('/generateLoanPDF/:key', async function(req, res, next) {
    if(req.session.NID == null)res.redirect('/user');
    else{
    var result = await queryAsset(req.params.key , req.session.NID);
    var obj;
    obj = JSON.parse(result);
  var myDoc = new PDFDocument({bufferPages: true});
  
  let buffers = [];
  myDoc.on('data', buffers.push.bind(buffers));
  myDoc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
      'Content-Length': Buffer.byteLength(pdfData),
      'Content-Type': 'application/pdf',
      'Content-disposition': 'attachment;filename='+obj.OwnerName+'.pdf',})
      .end(pdfData);
      
  });
  
  myDoc.font('Times-Roman')
       .fontSize(12)
       .text('Respected '+obj.OwnerName )
       .text('This is to confirm that your loan request against Property ' + req.params.key + ' has been approved by our approval team. We are glad to provide you with the said amount as a loan. You already have the documents related to Loan. Some more documents will be necessary before the final disbursal of the loan and you will get the details in the bank to this confirmation letter. You are further informed to abide by the payment dates of Loan in order to avoid additional interest and late penalties. We look forward to having a good transaction with you.')
       .text('Sincerely'); 
       myDoc.end();
}
  });


  

router.get('/ViewRequest/:key',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ViewRequest' , {title:  req.params.key, key: req.params.key , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result,
  notifications:notifications});
  }
});


router.get('/ViewLoanRequest/:key',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ViewLoanRequests' , {title:  req.params.key, key: req.params.key , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result,
  notifications:notifications});
  }
});

router.get('/deleteRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.RequestedByNID)res.redirect('/user/logout');
  else{

  await Advertise(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = true;
   res.redirect('/request/myRequests');
  }
});

router.get('/deleteLoanRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.RequestedByNID)res.redirect('/user/logout');
  else{

  await changeLoanStatus(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = true;
   res.redirect('/asset/Loan');
  }
});

router.get('/acceptRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerCNIC)res.redirect('/user/logout');
  else{
  
  await changeOwnerAck(req.session.NID,req.params.key);
  req.session.success = "accepted";
   res.redirect('/request/ReceivedRequests');
  }
});

router.get('/acceptTransferRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerCNIC)res.redirect('/user/logout');
  else{
  
  
  await Advertise(req.session.NID,obj.AssetCode);
  await changeOwnerAck(req.session.NID,req.params.key);
  req.session.success = "accepted";
   res.redirect('/request/ReceivedRequests');
  }
});




router.get('/rejectRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerCNIC)res.redirect('/user/logout');
  else{


  await Advertise(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = "rejected";
   res.redirect('/request/ReceivedRequests');
  }
});
router.get('/rejectRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerCNIC)res.redirect('/user/logout');
  else{


  await Advertise(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = "rejected";
   res.redirect('/request/ReceivedRequests');
  }
});






//////////////////


module.exports = router;
