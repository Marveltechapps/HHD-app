import React from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

export default function DeviceIcon({ width = 17.5, height = 17.5 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Defs>
        <ClipPath id="clip0_234_9">
          <Rect width="17.5" height="17.5" fill="white" transform="scale(1.02857)" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_234_9)">
        <Path
          d="M12.75 1.49999H5.25004C4.42161 1.49999 3.75004 2.17157 3.75004 2.99999V15C3.75004 15.8284 4.42161 16.5 5.25004 16.5H12.75C13.5785 16.5 14.25 15.8284 14.25 15V2.99999C14.25 2.17157 13.5785 1.49999 12.75 1.49999Z"
          stroke="#6B46C1"
          strokeWidth="1.45833"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 13.5H9.0075"
          stroke="#6B46C1"
          strokeWidth="1.45833"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

