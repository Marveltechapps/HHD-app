import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ProfileIcon({ width = 24.5, height = 24.5, color = '#6B7280' }: { width?: number; height?: number; color?: string }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M19.7916 21.875V19.7917C19.7916 18.6866 19.3526 17.6268 18.5712 16.8454C17.7898 16.064 16.73 15.625 15.625 15.625H9.37496C8.26989 15.625 7.21008 16.064 6.42868 16.8454C5.64728 17.6268 5.20829 18.6866 5.20829 19.7917V21.875"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 11.4583C14.8011 11.4583 16.6666 9.59285 16.6666 7.29167C16.6666 4.99048 14.8011 3.125 12.5 3.125C10.1988 3.125 8.33329 4.99048 8.33329 7.29167C8.33329 9.59285 10.1988 11.4583 12.5 11.4583Z"
        stroke={color}
        strokeWidth="2.55208"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

