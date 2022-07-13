const express = require("express");
var smpp = require('smpp');
// const cors = require('cors');
// const smppSession = require('./controllers/smpp');

//****** Establishing SMPP Connection ********//
var session = smpp.connect({
        url: 'smpp://172.22.93.244:8001',
        auto_enquire_link_period: 10000,
        debug: true
}, function() {
        session.bind_transceiver({
        system_id: 'VISOR_OTP',
        password: 'V150R019',
        system_type: 'MT', 
      }, function(pdu) {
            if (pdu.command_status === 0) {
              // Successfully bound
              console.log(pdu);
              if (pdu.command_status == 0) {
                console.log('Successfully bound to SMSC')
              }else{
                console.log('Error trying to bind to SMSC')
              }
          }
      });
});

// On Session Close Event
session.on('close', () => {
  console.log('smpp is now disconnected, not bound to SMSC')
  session.connect(); //reconnect again
});

// On Session Error Event
session.on('error', function(e) {
  // empty callback to catch emitted errors to prevent exit due unhandled errors
  console.log('smpp error', e.code)        
});  

const app = express();
app.use(express.json());
  

// ************************ submit_sm *********************** //

const sendSmsPCA =  (phoneNumber, message, session) => {

  return new Promise((resolve) => {
    
    session.submit_sm({
      source_addr: '6231',
      destination_addr: phoneNumber,
      short_message: message,
      dest_addr_ton: 1,      
      data_coding:3,
   }, function(pdu) {         
      resolve(pdu);                            
   }); 
      
  })
}

// ***************************** Express Routes ******************************** //

app.get('/',function(req,res) {
    res.status(200).send('Welcome to the contactserviceMFA API ');
})

app.post('/sendSmsViaSmpp', (req,res) => {
  
  let phoneNumber = req.body.phoneNumber;
  let message = req.body.message;

  sendSmsPCA(phoneNumber, message, session).then(pdu => { 

    console.log("SUBMIT_SM_RESPONSE: ", pdu); 
    
    if (pdu.command_status == 0) {
      res.status(200).json({
        status: "Success",
        message: "Message successfully sent",
        pduResponse: pdu      
      });  
    } else{
      res.status(200).json({
        status: "failed",
        message: "Message cannot be sent",
        pduMessageId: pdu      
      });
    }
    
  })
  .catch(error => {
    // console.error(error)
    console.log("Result from VM: ",error); 
    res.status(200).json({
      status: "Failed",
      error: error      
    });  
  })
  
});

// ************************************************************* //

const PORT = process.env.PUERTO || 4000;

app.listen(PORT, function(err){

    if (err) console.log(err);    
    console.log("Server listening on PORT", PORT);
  
});
