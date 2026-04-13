import { useState, useEffect } from "react";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { isReducedMotionEnabled } from "../lib/motion";

setWasmUrl("/dotlottie-player.wasm");

interface Props {
  src: string;
}

export default function CatLottie({ src }: Props) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(!isReducedMotionEnabled());

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ reduced: boolean }>;
      setShouldRender(!custom.detail.reduced);
    };
    window.addEventListener("siren-motion-change", handler);
    return () => window.removeEventListener("siren-motion-change", handler);
  }, []);

  if (!shouldRender) return null;

  return (
    <DotLottieReact
      src={src}
      autoplay
      loop
      style={{ width: "200px", height: "200px", display: "block" }}
    />
  );
}
