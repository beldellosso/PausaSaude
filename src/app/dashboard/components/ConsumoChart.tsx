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
    <div className="w-full h-64 bg-gray-900 p-4 rounded-xl border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Consumo Calórico por Refeição</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Bar dataKey="calorias" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};