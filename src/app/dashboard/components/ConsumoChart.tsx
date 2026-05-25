'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataPoint {
  name: string;
  calorias: number;
}

interface ConsumoChartProps {
  data: DataPoint[];
}

export const ConsumoChart: React.FC<ConsumoChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">Consumo Calórico por Refeição</h3>
        <p className="text-xs text-gray-400">Distribuição energética dos alimentos registrados</p>
      </div>
      <ResponsiveContainer width="100%" height="75%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#bae6fd" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderColor: '#f3f4f6', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
            }}
            labelStyle={{ color: '#4b5563', fontWeight: 600 }}
          />
          {/* Cor Azul Pastel Suave */}
          <Bar dataKey="calorias" fill="#bae6fd" activeBar={{ fill: '#bae6fd' }} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};