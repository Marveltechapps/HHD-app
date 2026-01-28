import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function TasksIcon({ width = 24.5, height = 24.5, color = '#6B7280' }: { width?: number; height?: number; color?: string }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M15.625 2.08329H9.37496C8.79966 2.08329 8.33329 2.54966 8.33329 3.12496V5.20829C8.33329 5.78359 8.79966 6.24996 9.37496 6.24996H15.625C16.2003 6.24996 16.6666 5.78359 16.6666 5.20829V3.12496C16.6666 2.54966 16.2003 2.08329 15.625 2.08329Z"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.6667 4.16671H18.75C19.3026 4.16671 19.8325 4.3862 20.2232 4.7769C20.6139 5.1676 20.8334 5.69751 20.8334 6.25004V20.8334C20.8334 21.3859 20.6139 21.9158 20.2232 22.3065C19.8325 22.6972 19.3026 22.9167 18.75 22.9167H6.25004C5.69751 22.9167 5.1676 22.6972 4.7769 22.3065C4.3862 21.9158 4.16671 21.3859 4.16671 20.8334V6.25004C4.16671 5.69751 4.3862 5.1676 4.7769 4.7769C5.1676 4.3862 5.69751 4.16671 6.25004 4.16671H8.33338"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 11.4583H16.6667"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 16.6667H16.6667"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33329 11.4583H8.3435"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33329 16.6667H8.3435"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

