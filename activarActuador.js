// Script correspondiente a la función Lambda activarActuador que dado el valor de humedad publicado por el sensor
// cambia el estado del actuador de apagado a encendido

// actualiza en la sombra el estado deseado de power a encendido
exports.handler = function (event, context,callback) {
    var AWS = require('aws-sdk');
    var iotdata = new AWS.IotData({endpoint: 'a3d2gzsm7xk4pu-ats.iot.us-east-1.amazonaws.com'});

    var params = {
        topic: '$aws/things/controlador1/shadow/update',
        payload: JSON.stringify({
    "state": {
        "desired": {
            "power": true
        }
    }
}),
        qos: 0
    };

iotdata.publish(params, function(err, data) {
    if(err){
        console.log(err);
    }
    else{
        console.log("Success.");
        //context.succeed();
    }
});

// Actualiza en la sombra del dispositivo el estado de power a Apagado
setTimeout(function() {
     var params = {
        topic: '$aws/things/controlador1/shadow/update',
        payload: JSON.stringify({
    "state": {
        "desired": {
            "power": false
        }
    }
}),
        qos: 0
    }
    
    return iotdata.publish(params, function(err, data) {
    if(err){
        console.log(err);
    }
    else{
        console.log("Success.");
        //context.succeed();
    }
});
},5000);


}

