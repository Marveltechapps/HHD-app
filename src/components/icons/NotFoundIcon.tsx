import React from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

export default function NotFoundIcon({
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
      <G clipPath="url(#clip0_307_710)">
        <Path
          d="M6.99984 12.8334C10.2215 12.8334 12.8332 10.2217 12.8332 7.00002C12.8332 3.77836 10.2215 1.16669 6.99984 1.16669C3.77818 1.16669 1.1665 3.77836 1.1665 7.00002C1.1665 10.2217 3.77818 12.8334 6.99984 12.8334Z"
          stroke={color}
          strokeWidth="1.16667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 4.66669V7.00002"
          stroke={color}
          strokeWidth="1.16667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 9.33331H7.00583"
          stroke={color}
          strokeWidth="1.16667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_307_710">
          <Rect width="14" height="14" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}


