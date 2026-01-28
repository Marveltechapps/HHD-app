import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function SnacksCategoryIcon({
  width = 42,
  height = 42,
  color = '#F59E0B',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
      <Path
        d="M21 3.5C17.5388 3.5 14.1554 4.52636 11.2775 6.44928C8.39967 8.37221 6.15665 11.1053 4.83212 14.303C3.50758 17.5007 3.16102 21.0194 3.83627 24.4141C4.51151 27.8087 6.17822 30.927 8.62564 33.3744C11.0731 35.8218 14.1913 37.4885 17.5859 38.1637C20.9806 38.839 24.4993 38.4924 27.697 37.1679C30.8947 35.8434 33.6278 33.6003 35.5507 30.7225C37.4736 27.8446 38.5 24.4612 38.5 21C37.2838 21.3745 35.9885 21.4104 34.7534 21.1037C33.5183 20.7971 32.3901 20.1596 31.4903 19.2597C30.5904 18.3599 29.9529 17.2317 29.6463 15.9966C29.3397 14.7615 29.3755 13.4662 29.75 12.25C28.5338 12.6245 27.2385 12.6604 26.0034 12.3537C24.7683 12.0471 23.6401 11.4096 22.7403 10.5097C21.8404 9.60986 21.2029 8.48173 20.8963 7.24664C20.5896 6.01155 20.6255 4.71623 21 3.5Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.875 14.875V14.8925"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 27.125V27.1425"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 21V21.0175"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.25 29.75V29.7675"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.25 24.5V24.5175"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

