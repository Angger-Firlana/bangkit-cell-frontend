import React from 'react';
import clsx from 'clsx';

type Props = {
  className?: string;
  title?: string;
};

// Simple, legible mark: phone + lightning bolt.
const LogoMark: React.FC<Props> = ({ className, title = 'BangkitCell' }) => {
  return (
    <svg
      className={clsx('inline-block', className)}
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.25 2.75h7.5c1.38 0 2.5 1.12 2.5 2.5v13.5c0 1.38-1.12 2.5-2.5 2.5h-7.5c-1.38 0-2.5-1.12-2.5-2.5V5.25c0-1.38 1.12-2.5 2.5-2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 6.1 9.2 11h2.4l-1 6.9 4.8-7.1h-2.5l1.3-4.7Z"
        fill="currentColor"
      />
      <circle cx="12" cy="19" r="0.75" fill="currentColor" opacity="0.9" />
    </svg>
  );
};

export default LogoMark;

