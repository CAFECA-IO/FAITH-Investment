'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalDataItem {
  date: string;
  close: number;
}

interface ChartComponentProps {
  historicalData: HistoricalDataItem[];
}

export default function ChartComponent({ historicalData }: ChartComponentProps) {
  const chartData = {
    labels: historicalData.map((item) => item.date),
    datasets: [
      {
        label: '台積電 30 日收盤價',
        data: historicalData.map((item) => item.close),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
}
