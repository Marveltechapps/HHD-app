import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function LightIcon({
  width = 14,
  height = 14,
  color = '#1A1A1A',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M3.5 1.17V12.84"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 3.5H10.5"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6.42" cy="6.42" r="0.585" fill={color} />
    </Svg>
  );
}

