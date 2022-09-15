// Registro de la sombra de dispositivo y actualización de estado del mismo 
// El actuador estará encendido cuando power=TRUE


//Requerir SDK de dispositivo de AWS IoT
const awsIoT = require('aws-iot-device-sdk');

//Cargar el endpoint de AWS
const endpointFile = require('/home/ec2-user/environment/endpoint.json');

//Nombre del objeto
const thingName = __dirname.split('/').pop();

//Obtener el Token de Cliente Inicial
let initialGetClientToken;

// Estado inicial del controlador : Apagado
const initialState = {
    state: { 
        reported: { 
            power: false
        }, 
        desired: null 
    }
};

// Se crea la sombra con los datos de AWS
const thingShadows = awsIoT.thingShadow({
   keyPath: '2d0f5fadcad07be3153f0dc30c363d6abd03683c2f8f7cbc8440be1d3b4095c2-private.pem.key',
  certPath: '2d0f5fadcad07be3153f0dc30c363d6abd03683c2f8f7cbc8440be1d3b4095c2-certificate.pem.crt',
    caPath: '/home/ec2-user/environment/root-CA.crt',
  clientId: thingName,
      host: endpointFile.endpointAddress
});

// Register sirve para suscribirse a los topic de la sombra para escuchar deltas y actualizaciones
thingShadows.register(thingName, {}, function(err, failedTopics) {
    if (isUndefined(err) && isUndefined(failedTopics)) {
        console.log('Se registro el ' + thingName + ' .\r\nEnviando get para establecer el estado');
        initialGetClientToken = thingShadows.get(thingName); // Con el get se obtiene la sombra de la cosa
    }
});

// Cuando ocurre un evento del tipo Delta generado por IoT: 
// El stateObject es el objeto que devuelve la operacion que produce el delta
thingShadows.on('delta', function(thingName, stateObject) {
    
    
    //Si se modifico el atributo power, el power del stateObject no es nulo entonces se muestra
    if (!isUndefined(stateObject.state.power)) {
        outputpowerstate(stateObject.state.power);
    }
    
    // Se reporta el nuevo estado
    console.log('Estado reportado actualizado')
    // Actualizo el estado reportado al estado del stateObject
    thingShadows.update(thingName, { state: { reported: stateObject.state, desired: null } } );
    
   
});


// Funcion para mostrar el estado de power
function outputpowerstate(power) {
    if (power) {
        console.log('El actuador esta ENCENDIDO');
    } else {
        console.log('El actuador esta APAGADO');
    }
}

// Funcion para chequear si un valor es undefined o null
function isUndefined(value) {
    return typeof value === 'undefined' || value === null;
}

// Un evento del tipo status ocurre cuando se recibe un get/update/delete
// thingName es el nombre de la sombra de la cosa para la cual se completo la operacion
// statusType es el estado de la operacion que puede ser aceptado o rechazado
// clientToken es el clienttoken de la operacion
// stateObject es el objeto que devuelve la operacion
thingShadows.on('status', function(thingName, statusType, clientToken, stateObject) {
    
    // Resolucion del estado inicial del status. Puede no haber estado, estado de delta o estado reportado.
    
    //Si el clientToken es de nuestro get inicial y el statusType es rejected
    //Esto significa que la sombre fue borrada y hay que poner los parametros por default
    if (initialGetClientToken === clientToken && statusType === 'rejected') {
        
        setDefaultState();
    }
    
    //Si el clientToken es de nuestro get inicial y el statusType es accepted
    //Esto significa que hay una sombra pero puede estar vacia
    if (initialGetClientToken === clientToken && statusType === 'accepted') {
        console.log('Se recibieron los datos del get inicial.');
        
        // Si la sombra esta vacia, settear los parametros por default
        if (Object.keys(stateObject.state).length == 0) {
            setDefaultState();
        } 
        //Sino, chequear si hay un estado delta
        else if (stateObject.state.hasOwnProperty('delta')) {
            console.log('Se encontro un Delta en la configuracion inicial para el estado');
            
            //Si se modifico el estado de power, mostrar
            if (!isUndefined(stateObject.state.delta.power)) {
                outputpowerstate(stateObject.state.delta.power);
            }
            
            // Reportar a la Sombra el nuevo estado
            thingShadows.update(thingName, { state: { reported: stateObject.state.delta, desired: null } } );
            
        } else {
            //Si el estado no esta vacio y no hay delta, hay un estado reportado
            
            //Si se reporto el atributo power, se muestra
            if (stateObject.state.reported.hasOwnProperty('power')) {
                
                
                console.log('Se encontro un estado previo reportado, configuando el estado del actuador a ese valor');
                outputpowerstate(stateObject.state.reported.power);
            } else {
                
                // Sino, asignar los parametros por default
                setDefaultState();
            }
        }
    }
});

// Desregistrar la sombra cuando se cierra la conexión
thingShadows.on('close', function() {
    console.log('La conexion se ha cerrado. Des-registrando la sombra');
      thingShadows.unregister(thingName);
});

// Asignación del estado por default
function setDefaultState() {
    console.log('No se encontro un estado del actuador, configurando al estado por default.');
    thingShadows.update(thingName, initialState);
    outputpowerstate(initialState.state.reported.power);
}

