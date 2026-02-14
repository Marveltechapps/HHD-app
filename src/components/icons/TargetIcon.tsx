import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function TargetIcon({ width = 17.5, height = 17.5, color = '#48BB78' }: { width?: number; height?: number; color?: string }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.00004 16.5C13.1422 16.5 16.5 13.1421 16.5 9.00001C16.5 4.85787 13.1422 1.50001 9.00004 1.50001C4.85791 1.50001 1.50004 4.85787 1.50004 9.00001C1.50004 13.1421 4.85791 16.5 9.00004 16.5Z"
        stroke={color}
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 13.5C11.4853 13.5 13.5 11.4853 13.5 9C13.5 6.51472 11.4853 4.5 9 4.5C6.51472 4.5 4.5 6.51472 4.5 9C4.5 11.4853 6.51472 13.5 9 13.5Z"
        stroke={color}
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.99996 10.5C9.82839 10.5 10.5 9.82842 10.5 8.99999C10.5 8.17156 9.82839 7.49999 8.99996 7.49999C8.17153 7.49999 7.49996 8.17156 7.49996 8.99999C7.49996 9.82842 8.17153 10.5 8.99996 10.5Z"
        stroke={color}
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

