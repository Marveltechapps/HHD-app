import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function GroceryCategoryIcon({
  width = 42,
  height = 42,
  color = '#6B46C1',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
      <Path
        d="M28 17.5C28 19.3565 27.2625 21.137 25.9497 22.4497C24.637 23.7625 22.8565 24.5 21 24.5C19.1435 24.5 17.363 23.7625 16.0503 22.4497C14.7375 21.137 14 19.3565 14 17.5"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.43018 10.5595H36.5697"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.95 9.56725C5.49562 10.1731 5.25 10.91 5.25 11.6672V35C5.25 35.9283 5.61875 36.8185 6.27513 37.4749C6.9315 38.1313 7.82174 38.5 8.75 38.5H33.25C34.1783 38.5 35.0685 38.1313 35.7249 37.4749C36.3813 36.8185 36.75 35.9283 36.75 35V11.6672C36.75 10.91 36.5044 10.1731 36.05 9.56725L32.55 4.9C32.224 4.46531 31.8012 4.1125 31.3152 3.8695C30.8293 3.62651 30.2934 3.5 29.75 3.5H12.25C11.7066 3.5 11.1707 3.62651 10.6848 3.8695C10.1988 4.1125 9.77601 4.46531 9.45 4.9L5.95 9.56725Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

