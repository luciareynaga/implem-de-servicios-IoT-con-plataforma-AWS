# implem-de-servicios-IoT-con-plataforma-AWS
Implementacion de servicios IoT con plataforma AWS - Castillo , Reynaga

Usando la plataforma de AWS se implementó un sistema de riego automatizado, este sistema está formado por sensores de humedad de suelo, y controladores que activan el riego del suelo.
De los sensores interesan el identificador de sensor, la ubicación del mismo, el valor de humedad medido y, la fecha y hora en que se tomó la medida de humedad. Cada sensor entregará valores comprendidos entre 0 (agua) y 1023 (aire) lo que se corresponde a un valor alto de humedad para valores numéricos bajos, y un valor bajo de humedad para valores numéricos altos. (Ver documentación sensor considerado). Cada sensor cubrirá una superficie de 20 metros cuadrados, y tomará una medida de la humedad del suelo con una frecuencia fija configurable.
De los actuadores, o bombas, interesan el identificador de actuador, la ubicación y el estado del mismo. El estado tendrá dos posibles valores Encendido y Apagado, siendo este último el valor por defecto configurado para el actuador, y será capaz de cambiar de estado durante un periodo de tiempo fijo configurable. Además por cada sensor, se corresponderá un actuador.
Se considerará como valor de humedad bajo: valores mayores a 800; y se realiza la suposición de que el flujo de agua de la bomba es constante.



