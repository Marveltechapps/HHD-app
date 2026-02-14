import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function WarehouseIcon({
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
        d="M2.92 2.92L8.75 1.46L14.58 2.92V15.54H2.92V2.92Z"
        stroke={color}
        strokeWidth="2.92"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.75 1.46V15.54"
        stroke={color}
        strokeWidth="2.92"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

