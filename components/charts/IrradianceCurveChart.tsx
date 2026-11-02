"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { HourlyIrradiancePoint } from "../../lib/services/openMeteo";

interface IrradianceCurveChartProps {
  hourly: HourlyIrradiancePoint[];
  currentSolarWp: number;
}

export const IrradianceCurveChart: React.FC<IrradianceCurveChartProps> = ({
  hourly,
  currentSolarWp,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Solar Irradiance & Generation Curve (Today)
          </h4>
          <p className="text-xs text-slate-500">
            Diurnal shortwave radiation curve with cloud attenuation overlay
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-medium">Right Now</div>
          <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
            {currentSolarWp} W/m²
          </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourly} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              unit=" W"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              unit="%"
            />
            <Tooltip
              formatter={(val: any, name: string) => [
                name === "shortwaveRadiation" ? `${val} W/m²` : `${val}%`,
                name === "shortwaveRadiation" ? "Solar Irradiance" : "Cloud Cover",
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "1px solid #334155",
                color: "#fff",
                fontSize: "11px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }}
              formatter={(val) => (val === "shortwaveRadiation" ? "Solar Irradiance (W/m²)" : "Cloud Cover (%)")}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="shortwaveRadiation"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#solarGradient)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cloudCover"
              stroke="#94a3b8"
              fillOpacity={1}
              fill="url(#cloudGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
