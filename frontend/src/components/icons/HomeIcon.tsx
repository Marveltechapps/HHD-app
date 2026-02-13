import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function HomeIcon({ width = 24.5, height = 24.5, color = '#6B46C1' }: { width?: number; height?: number; color?: string }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M15.625 21.875V13.5417C15.625 13.2654 15.5153 13.0004 15.3199 12.8051C15.1246 12.6097 14.8596 12.5 14.5833 12.5H10.4167C10.1404 12.5 9.87545 12.6097 9.6801 12.8051C9.48475 13.0004 9.375 13.2654 9.375 13.5417V21.875"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.125 10.4166C3.12493 10.1136 3.19097 9.81415 3.31853 9.53925C3.44609 9.26435 3.63208 9.02058 3.86354 8.82496L11.1552 2.57496C11.5312 2.25716 12.0077 2.08279 12.5 2.08279C12.9923 2.08279 13.4688 2.25716 13.8448 2.57496L21.1365 8.82496C21.3679 9.02058 21.5539 9.26435 21.6815 9.53925C21.809 9.81415 21.8751 10.1136 21.875 10.4166V19.7916C21.875 20.3442 21.6555 20.8741 21.2648 21.2648C20.8741 21.6555 20.3442 21.875 19.7917 21.875H5.20833C4.6558 21.875 4.12589 21.6555 3.73519 21.2648C3.34449 20.8741 3.125 20.3442 3.125 19.7916V10.4166Z"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

