import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CheckIcon({
  width = 14,
  height = 14,
  color = '#FFFFFF',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.67 1.17L5.25 7.58L2.33 4.67"
        stroke={color}
        strokeWidth="1.17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

