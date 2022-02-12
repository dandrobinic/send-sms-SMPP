const smpp = require('smpp');

const smppSession = async (req, res) => {
    
    const session = await smpp.connect({
        url: 'smpp://172.22.93.244:8001',
        debug: true
    },function() {
        const session_bind_transmitter = session.bind_transmitter({
            system_id: 'VISOR_OTP',
            password: 'V150R019',
            system_type: 'MT'  
            // addr_ton: 1,
            // addr_npi: 1,
        }, function(pdu) {
            // console.log("conecto bind_transceiver")               
            
                //res.json({"PDU - submit_sm":pdu}); 
                res.json({"PDU ":pdu});  
                if (pdu.command_status === 0) {
                    // Successfully bound               
                    session.submit_sm({
                        destination_addr: '+573115627114',
                        short_message: 'Testing SMPP',
                        source_addr: '6231'                     
                    }, function(pdu) {        
                        
                        if (pdu.command_status === 0) {
                            // Message successfully sent
                           
                            console.log("message ID:",pdu.message_id);
                        }
                    });
                }            
        });
    });

    
    // console.log(smppConnect)
    //res.send('Ruta de Inicio para SMPP');
}

module.exports = smppSession;