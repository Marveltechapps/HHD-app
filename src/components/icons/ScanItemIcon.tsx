import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ScanItemIcon({
  width = 14,
  height = 14,
  color = '#FFFFFF',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.75 4.08333V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H4.08333"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.9165 1.75H11.0832C11.3926 1.75 11.6893 1.87292 11.9081 2.09171C12.1269 2.3105 12.2498 2.60725 12.2498 2.91667V4.08333"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.2498 9.91669V11.0834C12.2498 11.3928 12.1269 11.6895 11.9081 11.9083C11.6893 12.1271 11.3926 12.25 11.0832 12.25H9.9165"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.08333 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0834V9.91669"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.0835 7H9.91683"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


