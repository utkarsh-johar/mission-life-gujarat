"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { CashFlowYear } from "../../lib/engine/solar";

interface SolarBreakEvenChartProps {
  cashFlow: CashFlowYear[];
  netCost: number;
  breakEvenYear: number;
  currencyFormatter?: (v: number) => string;
}

export const SolarBreakEvenChart: React.FC<SolarBreakEvenChartProps> = ({
  cashFlow,
  netCost,
  breakEvenYear,
  currencyFormatter = (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
}) => {
  // Format chart data
  const chartData = [
    {
      yearLabel: "Year 0",
      year: 0,
      cumulativeSavings: 0,
      netCostLine: netCost,
    },
    ...cashFlow.map((cf) => ({
      yearLabel: `Year ${cf.year}`,
      year: cf.year,
      cumulativeSavings: cf.cumulativeSavingsInr,
      netCostLine: netCost,
      annualSavings: cf.savingsInr,
      generationKwh: cf.generationKwh,
    })),
  ];

  // Find exact coordinate for ReferenceDot at break-even year
  const breakEvenPoint = chartData.find((d) => d.year === breakEvenYear) || chartData[chartData.length - 1];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            10-Year Cumulative Solar Savings vs. Net Capital Cost
          </h4>
          <p className="text-xs text-slate-500">
            Intersection indicates break-even payback year with 0.5% degradation & 3% tariff escalation
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          Payback: ~{breakEvenYear} Years
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: 10 }}>
            <XAxis dataKey="yearLabel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(val: any, name: string) => [
                currencyFormatter(Number(val)),
                name === "cumulativeSavings" ? "Cumulative Savings" : "Net Out-of-Pocket Cost",
              ]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "10px",
                border: "1px solid #334155",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => (value === "cumulativeSavings" ? "Cumulative Bill Savings" : "Net Investment Cost")}
            />

            {/* Horizontal Line for Net Capital Cost */}
            <ReferenceLine
              y={netCost}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Net Cost (${currencyFormatter(netCost)})`,
                position: "insideTopLeft",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />

            {/* Cumulative Savings Line */}
            <Line
              type="monotone"
              dataKey="cumulativeSavings"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 3, fill: "#0d9488" }}
              activeDot={{ r: 6 }}
            />

            {/* Break-even point marked with a ReferenceDot (AC-B4) */}
            {breakEvenPoint && (
              <ReferenceDot
                x={breakEvenPoint.yearLabel}
                y={breakEvenPoint.cumulativeSavings}
                r={7}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={2}
                label={{
                  value: `★ Break-Even (Yr ${breakEvenYear})`,
                  position: "top",
                  fill: "#d97706",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
