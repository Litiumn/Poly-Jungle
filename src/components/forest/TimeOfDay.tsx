'use client';

import { useState, useEffect } from 'react';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export interface TimeConfig {
  timeOfDay: TimeOfDay;
  lightIntensity: number;
  lightColor: string;
  skyColor: string;
}

export function useTimeOfDay(): TimeConfig {
  const [timeConfig, setTimeConfig] = useState<TimeConfig>(calculateTimeConfig());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeConfig(calculateTimeConfig());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return timeConfig;
}

function calculateTimeConfig(): TimeConfig {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) {
    return {
      timeOfDay: 'dawn',
      lightIntensity: 0.5,
      lightColor: '#ffa07a',
      skyColor: '#ff7f50',
    };
  } else if (hour >= 7 && hour < 12) {
    return {
      timeOfDay: 'morning',
      lightIntensity: 0.9,
      lightColor: '#fff8dc',
      skyColor: '#87ceeb',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      timeOfDay: 'afternoon',
      lightIntensity: 1.0,
      lightColor: '#ffffff',
      skyColor: '#4a90e2',
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      timeOfDay: 'dusk',
      lightIntensity: 0.6,
      lightColor: '#ff8c00',
      skyColor: '#ff6347',
    };
  } else {
    return {
      timeOfDay: 'night',
      lightIntensity: 0.3,
      lightColor: '#4169e1',
      skyColor: '#191970',
    };
  }
}

export function TimeOfDayIndicator({ timeOfDay }: { timeOfDay: TimeOfDay }): JSX.Element {
  const icons = {
    dawn: '🌅',
    morning: '☀️',
    afternoon: '🌤️',
    dusk: '🌇',
    night: '🌙',
  };

  const labels = {
    dawn: 'Dawn',
    morning: 'Morning',
    afternoon: 'Afternoon',
    dusk: 'Dusk',
    night: 'Night',
  };

  return (
    <div className="flex items-center gap-2 bg-white bg-opacity-80 px-3 py-2 rounded-full shadow-md">
      <span className="text-2xl">{icons[timeOfDay]}</span>
      <span className="text-sm font-semibold text-gray-700">{labels[timeOfDay]}</span>
    </div>
  );
}
