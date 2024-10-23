import { Global } from "@emotion/react";

export const Fonts = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'primary';
        src: url('/primary.ttf');
      }
      @font-face {
        font-family: 'secondary';
        src: url('/secondary.ttf');
      }
      `}
  />
);
