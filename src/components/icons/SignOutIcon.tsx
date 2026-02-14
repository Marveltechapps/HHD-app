import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function SignOutIcon({
  width = 14,
  height = 14,
  color = '#F56565',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.75 1.75H10.5C11.3284 1.75 12 2.42157 12 3.25V10.75C12 11.5784 11.3284 12.25 10.5 12.25H1.75"
        stroke={color}
        strokeWidth="1.17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.25 7H12"
        stroke={color}
        strokeWidth="1.17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33 4.08L12 7L9.33 9.92"
        stroke={color}
        strokeWidth="1.17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

