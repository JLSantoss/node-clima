const fs = require("fs");
const axios = require("axios");
const { leerInput } = require("../helpers/inquirer");
const { info } = require("console");
const { isUtf8 } = require("buffer");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  get paramsLocation() {
    return {
      limit: 5,
      accept_language: "es",
      format: "json",
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      const instance = axios.create({
        baseURL: `https://us1.locationiq.com/v1/search?key=${process.env.LOCATION_KEY}&q=${lugar}`,
        params: this.paramsLocation,
      });

      const resp = await instance.get();
      return resp.data.map((lugar) => ({
        id: lugar.place_id,
        nombre: lugar.display_name,
        lat: lugar.lat,
        lon: lugar.lon,
      }));
    } catch (error) {
      console.log("Ha ocurrido un error con la API location");
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      //instancia axios.create()
      const instanceClima = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        // otra forma de pasar los params, nos conviene esta más por que pasamos los parámetros directamente
        params: { ...this.paramsWeather, lat, lon },
      });

      // respuesta resp.data
      const respClima = await instanceClima.get();
      const { weather, main } = respClima.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log("Ha ocurrido un error con la API openweather");
      return [];
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0, 4);

    this.historial.unshift(lugar.toLocaleLowerCase());

    // Grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    // Si NO existe archivo para en el return
    if (!fs.existsSync(this.dbPath)) {
      return;
    }
    // SI existe
    const info = fs.readFileSync(this.dbPath, "utf-8");
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
