import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function OrderDetailsIcon({
  width = 21,
  height = 21,
  color = '#6B46C1',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 21 21" fill="none">
      <Path
        d="M9.625 19.0138C9.89103 19.1674 10.1928 19.2482 10.5 19.2482C10.8072 19.2482 11.109 19.1674 11.375 19.0138L17.5 15.5138C17.7658 15.3603 17.9865 15.1397 18.1401 14.874C18.2937 14.6083 18.3747 14.3069 18.375 14V7.00004C18.3747 6.69315 18.2937 6.39175 18.1401 6.12605C17.9865 5.86036 17.7658 5.63973 17.5 5.48629L11.375 1.98629C11.109 1.83269 10.8072 1.75183 10.5 1.75183C10.1928 1.75183 9.89103 1.83269 9.625 1.98629L3.5 5.48629C3.23423 5.63973 3.01348 5.86036 2.8599 6.12605C2.70632 6.39175 2.62531 6.69315 2.625 7.00004V14C2.62531 14.3069 2.70632 14.6083 2.8599 14.874C3.01348 15.1397 3.23423 15.3603 3.5 15.5138L9.625 19.0138Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 19.25V10.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.87866 6.125L10.4999 10.5L18.1212 6.125"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5625 3.73633L14.4375 8.24258"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

