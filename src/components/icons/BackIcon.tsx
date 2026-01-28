import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function BackIcon({
  width = 35,
  height = 35,
  color = '#1A1A1A',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 35 35" fill="none">
      <Path
        d="M17.5 23.625L11.375 17.5L17.5 11.375"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23.625 17.5H11.375"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

