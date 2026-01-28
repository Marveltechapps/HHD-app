import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function FreshCategoryIcon({
  width = 42,
  height = 42,
  color = '#48BB78',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
      <Path
        d="M14 3.5H28"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.75 3.5V8.38075C15.75 9.76288 15.3408 11.1141 14.574 12.264L13.426 13.986C12.6589 15.1364 12.2497 16.4883 12.25 17.871V35C12.25 35.9283 12.6187 36.8185 13.2751 37.4749C13.9315 38.1313 14.8217 38.5 15.75 38.5H26.25C27.1783 38.5 28.0685 38.1313 28.7249 37.4749C29.3813 36.8185 29.75 35.9283 29.75 35V17.8693C29.75 16.4871 29.3408 15.1359 28.574 13.986L27.426 12.264C26.6589 11.1136 26.2497 9.76173 26.25 8.379V3.5"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.25 26.25C13.6356 25.6697 15.1228 25.3709 16.625 25.3709C18.1272 25.3709 19.6144 25.6697 21 26.25C22.3856 26.8305 23.8728 27.1294 25.375 27.1294C26.8772 27.1294 28.3644 26.8305 29.75 26.25"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

