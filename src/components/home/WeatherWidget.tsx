"use client";

import { useEffect, useState } from "react";

// Mesmas coordenadas de Tucumã-PA usadas no widget de clima do cabeçalho.
const TUCUMA_LAT = -6.7563;
const TUCUMA_LON = -51.1573;
const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${TUCUMA_LAT}&longitude=${TUCUMA_LON}` +
  `&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min` +
  `&timezone=America%2FBelem&forecast_days=5`;

const REFRESH_MS = 10 * 60 * 1000; // clima não muda a cada segundo — 10 min é suficiente

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

function weatherLabel(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code === 1 || code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Neblina";
  if (code >= 51 && code <= 67) return "Chuva";
  if (code >= 80 && code <= 82) return "Pancadas de chuva";
  if (code >= 95) return "Tempestade";
  return "Parcialmente nublado";
}

function weekdayLabel(isoDate: string): string {
  // Meio-dia evita problema de fuso horário virando o dia errado no toLocaleDateString.
  const label = new Date(`${isoDate}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" });
  return label.charAt(0).toUpperCase() + label.slice(1, 3);
}

type CurrentWeather = { temp: number; code: number };
type DayForecast = { date: string; code: number; max: number; min: number };

export default function WeatherWidget() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [days, setDays] = useState<DayForecast[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const res = await fetch(WEATHER_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        setCurrent({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode,
        });

        const forecast: DayForecast[] = data.daily.time
          .slice(1, 5)
          .map((date: string, i: number) => ({
            date,
            code: data.daily.weathercode[i + 1],
            max: Math.round(data.daily.temperature_2m_max[i + 1]),
            min: Math.round(data.daily.temperature_2m_min[i + 1]),
          }));
        setDays(forecast);
      } catch {
        // API de clima fora do ar — mantém o último valor conhecido em vez de quebrar o widget.
      }
    }

    fetchWeather();
    const t = setInterval(fetchWeather, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="rounded-xl p-[18px] mb-5 text-white bg-gradient-to-br from-highlight to-[#1d4ed8]">
      <div className="font-menu text-[0.72rem] uppercase opacity-85 mb-1.5">Previsão do Tempo · Tucumã-PA</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.85rem] opacity-90">{current ? weatherLabel(current.code) : "Carregando..."}</div>
          <div className="font-title text-[2.4rem] font-bold">{current ? `${current.temp}°` : "--°"}</div>
        </div>
        <div className="text-[2.4rem]">{current ? weatherEmoji(current.code) : "⛅"}</div>
      </div>
      {days.length > 0 && (
        <div className="flex justify-between mt-3.5 text-[0.72rem] text-center">
          {days.map((d) => (
            <div key={d.date} className="opacity-90">
              {weekdayLabel(d.date)}
              <br />
              {weatherEmoji(d.code)}
              <br />
              {d.max}°/{d.min}°
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
