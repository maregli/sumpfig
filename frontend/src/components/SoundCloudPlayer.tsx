import React, { useEffect, useRef } from "react";

type SoundCloudPlayerProps = {
  src: string; // e.g. https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789
  height?: number;
  width?: number | string;
};

const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  src,
  height = 166,
  width = "100%",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <iframe
      id="sound-cloud-iframe"
      ref={iframeRef}
      title="SoundCloud Player"
      width={width}
      height={height}
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
      src={src}
    ></iframe>
  );
};

export default SoundCloudPlayer;
