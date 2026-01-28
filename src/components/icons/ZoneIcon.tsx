import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ZoneIcon({
  width = 32,
  height = 35,
  color = '#6B7280',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 35" fill="none">
      <Path
        d="M15.7498 18.0833C16.072 18.0833 16.3332 17.8222 16.3332 17.5C16.3332 17.1778 16.072 16.9167 15.7498 16.9167C15.4277 16.9167 15.1665 17.1778 15.1665 17.5C15.1665 17.8222 15.4277 18.0833 15.7498 18.0833Z"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7498 14C16.072 14 16.3332 13.7388 16.3332 13.4167C16.3332 13.0945 16.072 12.8333 15.7498 12.8333C15.4277 12.8333 15.1665 13.0945 15.1665 13.4167C15.1665 13.7388 15.4277 14 15.7498 14Z"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7498 22.1667C16.072 22.1667 16.3332 21.9055 16.3332 21.5833C16.3332 21.2612 16.072 21 15.7498 21C15.4277 21 15.1665 21.2612 15.1665 21.5833C15.1665 21.9055 15.4277 22.1667 15.7498 22.1667Z"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

