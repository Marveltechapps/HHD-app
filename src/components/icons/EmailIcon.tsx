import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function EmailIcon({
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
      <Rect
        x="1.46"
        y="2.92"
        width="14.58"
        height="11.67"
        rx="2"
        stroke={color}
        strokeWidth="1.46"
      />
      <Path
        d="M1.46 5.1L8.75 10.5L16.04 5.1"
        stroke={color}
        strokeWidth="1.46"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

