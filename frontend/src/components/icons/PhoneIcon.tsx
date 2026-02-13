import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function PhoneIcon({
  width = 17.5,
  height = 17.5,
  color = '#6B7280',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.65 1.46L10.21 1.46C10.79 1.46 11.25 1.92 11.25 2.5V15.5C11.25 16.08 10.79 16.54 10.21 16.54H3.65C3.07 16.54 2.61 16.08 2.61 15.5V2.5C2.61 1.92 3.07 1.46 3.65 1.46Z"
        stroke={color}
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.75 13.13H8.75"
        stroke={color}
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

