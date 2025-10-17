'use client';

import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { applyWindPreset, setWindDirectionByCompass, triggerWindGust } from '@/lib/wind-controller';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'foggy';

interface WeatherSystemProps {
  weather: WeatherType;
}

export function WeatherSystem({ weather }: WeatherSystemProps): JSX.Element {
  const [raindrops, setRaindrops] = useState<THREE.Vector3[]>([]);
  const [gustInterval, setGustInterval] = useState<NodeJS.Timeout | null>(null);

  // Apply weather-based wind effects
  useEffect(() => {
    // Clear previous gust interval
    if (gustInterval) {
      clearInterval(gustInterval);
    }

    switch (weather) {
      case 'sunny':
        applyWindPreset('gentle');
        setWindDirectionByCompass('east');
        break;
      
      case 'cloudy':
        applyWindPreset('moderate');
        setWindDirectionByCompass('west');
        break;
      
      case 'rainy':
        applyWindPreset('strong');
        setWindDirectionByCompass('southwest');
        // Trigger initial gust
        triggerWindGust(2000, 0.6);
        // Set up periodic gusts during rain
        const rainGustInterval = setInterval(() => {
          if (Math.random() < 0.4) {
            triggerWindGust(1500 + Math.random() * 1000, 0.5 + Math.random() * 0.3);
          }
        }, 4000);
        setGustInterval(rainGustInterval);
        break;
      
      case 'foggy':
        applyWindPreset('calm');
        setWindDirectionByCompass('north');
        break;
    }

    return () => {
      if (gustInterval) {
        clearInterval(gustInterval);
      }
    };
  }, [weather]);

  useEffect(() => {
    if (weather === 'rainy') {
      const drops: THREE.Vector3[] = [];
      for (let i = 0; i < 200; i++) {
        drops.push(
          new THREE.Vector3(
            Math.random() * 80 - 40,
            Math.random() * 50 + 20,
            Math.random() * 80 - 40
          )
        );
      }
      setRaindrops(drops);
    } else {
      setRaindrops([]);
    }
  }, [weather]);

  useFrame(() => {
    if (weather === 'rainy') {
      raindrops.forEach((drop) => {
        drop.y -= 0.5;
        if (drop.y < 0) {
          drop.y = 70;
        }
      });
    }
  });

  const getAmbientColor = (): string => {
    switch (weather) {
      case 'sunny':
        return '#ffffff';
      case 'cloudy':
        return '#b0c4de';
      case 'rainy':
        return '#708090';
      case 'foggy':
        return '#d3d3d3';
      default:
        return '#ffffff';
    }
  };

  const getAmbientIntensity = (): number => {
    switch (weather) {
      case 'sunny':
        return 0.7;
      case 'cloudy':
        return 0.5;
      case 'rainy':
        return 0.4;
      case 'foggy':
        return 0.45;
      default:
        return 0.6;
    }
  };

  const getFogColor = (): string => {
    switch (weather) {
      case 'sunny':
        return '#d4e8f0';
      case 'cloudy':
        return '#c0d8e8';
      case 'rainy':
        return '#9ba5b0';
      case 'foggy':
        return '#e0e0e0';
      default:
        return '#d4e8f0';
    }
  };

  const getFogDensity = (): [number, number] => {
    switch (weather) {
      case 'sunny':
        return [60, 150];
      case 'cloudy':
        return [50, 130];
      case 'rainy':
        return [40, 110];
      case 'foggy':
        return [20, 80];
      default:
        return [50, 150];
    }
  };

  return (
    <>
      <ambientLight color={getAmbientColor()} intensity={getAmbientIntensity()} />
      <fog attach="fog" args={[getFogColor(), ...getFogDensity()]} />

      {weather === 'rainy' && (
        <group>
          {raindrops.map((drop, i) => (
            <mesh key={i} position={drop}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
              <meshBasicMaterial color="#87ceeb" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {weather === 'foggy' && (
        <mesh position={[0, 5, 0]} scale={[100, 20, 100]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        </mesh>
      )}
    </>
  );
}
