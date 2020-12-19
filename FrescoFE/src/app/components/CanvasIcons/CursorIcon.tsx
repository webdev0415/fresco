import React from 'react';

export function CursorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18px"
      height="18px"
      {...props}
    >
      <path d="M 6 0 L 20.359375 13.449219 L 14.492188 13.980469 L 13.429688 14.078125 L 13.871094 15.050781 L 17.429688 22.847656 L 14.804688 24 L 11.410156 16.121094 L 10.984375 15.128906 L 10.195313 15.867188 L 6.027344 19.777344 L 6 0" />
    </svg>
  );
}
