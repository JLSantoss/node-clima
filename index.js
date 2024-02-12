require("colors");
require("dotenv").config();

const {
  inquirerMenu,
  pausa,
  leerInput,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./modules/busquedas");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();
    console.log({ opt });

    switch (opt) {
      case 1:
        // Mostrar el termino descrito por el usuario
        const termino = await leerInput("Ciudad: ");

        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        // Seleccionar el lugar
        const idSelected = await listarLugares(lugares);
        // Si al buscar el lugar decidimos elegir 0.salir volvemos al menu
        if (idSelected == "0") continue;
        const lugarSel = lugares.find((l) => l.id === idSelected);

        // Guardar el lugar en el hisorial
        busquedas.agregarHistorial(lugarSel.nombre);

        // Datos del clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lon);

        // Mostrar resultados
        console.clear();
        console.log("\nInfomración de la ciudad\n".green);
        console.log("Ciudad:", lugarSel.nombre.green);
        console.log("Lat:", lugarSel.lat.white);
        console.log("Lng:", lugarSel.lon.white);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:", clima.max);
        console.log("El clima está:", clima.desc.blue);

        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) {
      await pausa();
    }
  } while (opt !== 0);
};

main();
