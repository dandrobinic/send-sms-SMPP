const express = require("express");
var smpp = require('smpp');
// const cors = require('cors');
// const smppSession = require('./controllers/smpp');

const app = express();

app.use(express.json());

app.get('/',function(req,res) {
    res.status(200).send('Welcome to the contactserviceMFA API ');
})

app.post('/sendsmpp',function(req,res) {

    let phoneNumber = req.body.phoneNumber;
    let message = req.body.message;
        
    const session = new smpp.Session({host: '172.22.93.244', port: 8001});
    let isConnected = false
  
    session.on('connect', () => {
      isConnected = true;
      console.log('Successfully bound');
      session.bind_transceiver({
          system_id: 'VISOR_OTP',
          password: 'V150R019',
          system_type: 'MT', 
      }, (pdu) => {
        if (pdu.command_status == 0) {
            console.log('Successfully bound')
  
            session.submit_sm({
                source_addr: '6231',
                dest_addr_ton: 1,
                destination_addr: phoneNumber,
                short_message: 'message',
                data_coding:3,
            }, function(pdu) {
                console.log(pdu);
                if (pdu.command_status == 0) {
                    // Message successfully sent
                    session.close();
                    console.log("Message successfully sent");
                    res.status(200).json({
                      status: "Success",
                      message: "Message successfully sent",
                      pduMessageId: pdu.message_id,
                      sentTo: phoneNumber
                    });                                    
                }
            });        
        }
      })      
    })
  
    session.on('close', () => {
      console.log('smpp is now disconnected') 
      if (isConnected) {        
        session.connect();    //reconnect again
      }
    })
  
    session.on('error', error => { 
      console.log('smpp error:', error.message)   
      res.status(502).send(error.message);
      isConnected = false;
    });
  })

const PORT = process.env.PUERTO || 3030;

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
