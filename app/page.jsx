"use client";

import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [showUnits, setShowUnits] = useState(false);

  const [temperature, setTemperature] = useState("°C");
  const [windSpeed, setWindSpeed] = useState("km/h");
  const [precipitation, setPrecipitation] = useState("mm");

  const getWeatherIcon = (temp) => {
    if (temp === undefined || temp === null) return "/sun.webp";
    if (temp >= 30) return "/sun.webp";
    if (temp >= 20) return "/icon-partly-cloudy.webp";
    if (temp >= 10) return "/Icon-overcast.webp";
    return "/icon-snow.webp";
  };

  const getWeather = async () => {
    if (!city) return;

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const geoData = await geoRes.json();

      if (!geoData.results) {
        alert("City not found");
        return;
      }

      const { latitude, longitude, name, country } =
        geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min`
      );

      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country,
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        feelsLike: weatherData.current.apparent_temperature,
        wind: weatherData.current.wind_speed_10m,

        // HOURLY
        hourlyTimes: weatherData.hourly?.time || [],
        hourlyTemps: weatherData.hourly?.temperature_2m || [],

        // DAILY (FIXED — THIS WAS THE MAIN ISSUE)
        dailyTimes: weatherData.daily?.time || [],
        dailyMax: weatherData.daily?.temperature_2m_max || [],
        dailyMin: weatherData.daily?.temperature_2m_min || [],
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 p-6 text-white">

      {/* NAV */}
      <nav className="flex justify-between mb-6">
        <img src="/logo.svg" className="w-28" />
      </nav>

      {/* SEARCH */}
      <div className="flex justify-center gap-3 mb-8">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city..."
          className="w-96 p-3 rounded bg-gray-800"
        />

        <button
          onClick={getWeather}
          className="bg-blue-500 px-5 rounded"
        >
          Search
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2">

          {/* MAIN CARD */}
          <div className="relative rounded-2xl overflow-hidden">
            <img src="/bg-today-large.svg" className="w-full h-64 object-cover" />

            <div className="absolute inset-0 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {weather ? `${weather.city}, ${weather.country}` : "Search city"}
                </h2>

                <p className="text-sm text-gray-300">
                  Tuesday, August 5th 2025
                </p>
              </div>

              <div className="flex items-center gap-4">
                <img src="/sun.webp" className="w-16" />
                <h1 className="text-6xl font-bold">
                  {weather ? `${weather.temp}°` : "--°"}
                </h1>
              </div>
            </div>
          </div>

          {/* STATS */}
          {weather && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

              <div className="bg-gray-700 p-4 rounded-xl">
                Feels Like
                <div className="text-3xl font-bold">{weather.feelsLike}°</div>
              </div>

              <div className="bg-gray-700 p-4 rounded-xl">
                Humidity
                <div className="text-3xl font-bold">{weather.humidity}%</div>
              </div>

              <div className="bg-gray-700 p-4 rounded-xl">
                Wind
                <div className="text-3xl font-bold">{weather.wind} km/h</div>
              </div>

              <div className="bg-gray-700 p-4 rounded-xl">
                Precipitation
                <div className="text-3xl font-bold">0 mm</div>
              </div>

            </div>
          )}

          {/* DAILY FORECAST (FIXED) */}
          <div className="mt-6 bg-gray-700 p-5 rounded-xl">
            <h2 className="font-bold mb-4">Daily Forecast</h2>

            <div className="grid grid-cols-7 gap-3">
              {weather?.dailyTimes?.map((day, i) => (
                <div key={i} className="bg-gray-900 p-3 rounded-lg text-center">

                  <p className="text-sm">
                    {new Date(day).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>

                  <img
                    src={getWeatherIcon(weather.dailyMax[i])}
                    className="w-8 mx-auto my-2"
                  />

                  <p className="font-bold">
                    {weather.dailyMax[i]}° / {weather.dailyMin[i]}°
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="bg-gray-700 rounded-xl p-5">

          <h2 className="font-bold mb-4">Hourly Forecast</h2>

          <div className="space-y-3">

            {weather?.hourlyTimes?.slice(0, 12).map((time, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-600 p-3 rounded-lg"
              >

                <div>
                  {new Date(time).getHours()}:00
                </div>

                <img
                  src={getWeatherIcon(weather.hourlyTemps[index])}
                  className="w-8"
                />

                <div className="font-bold">
                  {weather.hourlyTemps[index]}°
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}