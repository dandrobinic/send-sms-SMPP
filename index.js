const express = require('express'); 
const cors = require('cors');
const smppSession = require('./controllers/smpp');
const smpp = require('smpp');

const session = new smpp.Session({host: '172.22.93.244', port: 8001});

let isConnected = false
session.on('connect', () => {
  isConnected = true;

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
            destination_addr: '573212232702',
            short_message: 'Testing SMPP via PCA',
            data_coding:3,
        }, function(pdu) {
            console.log(pdu);
            if (pdu.command_status == 0) {
                // Message successfully sent
                session.close();
                console.log("Message successfully sent");
                console.log(pdu.message_id);
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
  console.log('smpp error', error)   
  isConnected = false;
});

// const app = express();

// const puerto = process.env.PUERTO || 3333;

// app.listen(puerto,() => { console.log("Servidor Ok. Listing on Port: "+puerto) });