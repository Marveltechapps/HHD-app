import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CareCategoryIcon({
  width = 42,
  height = 42,
  color = '#3B82F6',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
      <Path
        d="M21 38.5C24.2489 38.5 27.3647 37.2094 29.6621 34.9121C31.9594 32.6147 33.25 29.4989 33.25 26.25C33.25 22.75 31.5 19.425 28 16.625C24.5 13.825 21.875 9.625 21 5.25C20.125 9.625 17.5 13.825 14 16.625C10.5 19.425 8.75 22.75 8.75 26.25C8.75 29.4989 10.0406 32.6147 12.3379 34.9121C14.6353 37.2094 17.7511 38.5 21 38.5Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

