// Pongo como requisito AWS IoT Device SDK
const awsIoT = require("aws-iot-device-sdk");

// Requerir criptografía para la generación de números aleatorios
const crypto = require("crypto");

// Cargo el endopoint desde el archivo
const endpointFile = require("/home/ec2-user/environment/endpoint.json");

// Obtengo el nombre del dispositivo del nombre de la carpeta
const deviceName = __dirname.split("/").pop();

// Crear la Shadow del objeto/cosa con los datos de mi AWS
const device = awsIoT.device({
  keyPath: "private.pem.key",
  certPath: "certificate.pem.crt",
  caPath: "/home/ec2-user/environment/root-CA.crt",
  clientId: deviceName,
  host: endpointFile.endpointAddress,
});

// Función que se ejecuta cuando se establece la conexión a IoT,
//Cuando ocurre un evento del tipo "connect" se ejecuta la funcion
device.on("connect", function () {
  console.log("Connected to AWS IoT");

  // Llamo la funcion que ejecuta un loop para enviar los mensajes MQTT
  infiniteLoopPublish();
});

//Funcion para enviar los datos del sensor cada 5 segundos
function infiniteLoopPublish() {
  console.log("Enviando datos a AWS IoT del sensor: " + deviceName);
  // Publico los datos del sensor al topic lab/sensors con la funcion getSensorData
  device.publish("lab/sensors", JSON.stringify(getSensorData(deviceName)));

  //Comienzo el loop infinito para publicar cada 5 seg Infinite
  setTimeout(infiniteLoopPublish, 5000);
}

// Funcion para crear un numero random tipo float entre un max y un min
function randomFloatBetween(minValue, maxValue) {
  return parseFloat(
    Math.min(minValue + Math.random() * (maxValue - minValue), maxValue)
  ).toFixed(1);
}

//Funcion para crear una MAC aleatoria que identifique el sensor
function randomMAC(){
    var hexDigits = "0123456789ABCDEF";
    var macAddress = "";
    for (var i = 0; i < 6; i++) {
        macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
        macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
        if (i != 5) macAddress += ":";
    }

    return macAddress;
}

// Funcion para generar datos random del sensor deviceName
function getSensorData(deviceName) {
  let message = {
    moisture: crypto.randomInt(0, 1023),
    temperature: randomFloatBetween(0,50),
  };

  const device_data = {
    sensor1: {
    id: "10:08:64:5f:f5:67",
    latitude :39.122229,
    longitude:-77.133578
    },
  };

  message["id"] = device_data[deviceName].id;
  message["device"] = deviceName;
  message["latitude"] = device_data[deviceName].latitude;
  message["longitude"] = device_data[deviceName].longitude;
  message['datetime'] = new Date().toISOString().replace(/\..+/, '');

  return message;
}
