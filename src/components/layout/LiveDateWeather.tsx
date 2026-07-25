"use client";

import { useEffect, useState } from "react";

// Coordenadas de Tucumã-PA (mesmas do link de previsão do MSN no cabeçalho).
const TUCUMA_LAT = -6.7563;
const TUCUMA_LON = -51.1573;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${TUCUMA_LAT}&longitude=${TUCUMA_LON}&current_weather=true`;
const MSN_FORECAST_URL =
  "https://www.msn.com/pt-br/clima/forecast/in-Tucum%C3%A3,Par%C3%A1?loc=eyJsIjoiVHVjdW3DoyIsInIiOiJQYXLDoSIsImMiOiJCcmFzaWwiLCJpIjoiQlIiLCJnIjoicHQtYnIiLCJ4IjoiLTUxLjE1NzI5OTA0MTc0ODA1IiwieSI6Ii02Ljc1NjMxOTk5OTY5NDgyNCJ9&weadegreetype=C&ocid=winp1taskbar&cvid=6a641d61480544b78f6e79a4a2c81224";

const WEATHER_REFRESH_MS = 10 * 60 * 1000; // clima não muda a cada segundo — 10 min é suficiente
const DATE_CHECK_MS = 60 * 1000; // checa a virada do dia a cada minuto

function formatToday(): string {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// Códigos WMO retornados pela Open-Meteo — mapeados pro emoji mais próximo.
function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "❄️";
  if (code >= 95) return "⛈️";
  return "☀️";
}

export default function LiveDateWeather() {
  const [today, setToday] = useState(formatToday);
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setToday(formatToday()), DATE_CHECK_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const res = await fetch(WEATHER_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          icon: weatherEmoji(data.current_weather.weathercode),
        });
      } catch {
        // API de clima fora do ar — mantém o último valor conhecido em vez de quebrar a barra.
      }
    }

    fetchWeather();
    const t = setInterval(fetchWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <>
      <span className="opacity-90 flex items-center gap-1">📅 {today}</span>
      <a
        href={MSN_FORECAST_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-90 flex items-center gap-1 hover:text-primary hover:opacity-100"
      >
        {weather ? `${weather.icon} Tucumã ${weather.temp}°C` : "☀️ Tucumã ..."}
      </a>
    </>
  );
}
