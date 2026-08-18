import type { CSSProperties } from "react";

export type MascotState = "hero" | "home" | "happy" | "excited" | "proud" | "thinking" | "neutral" | "focused" | "confused" | "determined" | "celebrating" | "reading" | "listening" | "sleeping" | "tea";

const SPRITES: Record<MascotState, [number, number, number, number]> = {
  hero: [0, 20, 445, 735],
  home: [5, 780, 505, 460],
  happy: [470, 45, 190, 165],
  excited: [660, 20, 205, 195],
  proud: [865, 35, 195, 185],
  thinking: [1060, 55, 190, 175],
  neutral: [490, 235, 185, 190],
  focused: [680, 225, 195, 205],
  confused: [885, 230, 185, 200],
  determined: [1065, 225, 185, 210],
  celebrating: [795, 715, 180, 195],
  reading: [475, 715, 175, 195],
  listening: [635, 715, 175, 195],
  sleeping: [520, 935, 355, 275],
  tea: [1070, 720, 180, 200],
};

interface MascotProps {
  state?: MascotState;
  width?: number;
  label?: string;
  className?: string;
}

export function Mascot({ state = "happy", width = 160, label = "Pandao, your Mandarin buddy", className = "" }: MascotProps) {
  const [x, y, sourceWidth, sourceHeight] = SPRITES[state];
  const scale = width / sourceWidth;
  const spriteUrl = import.meta.env.BASE_URL + "assets/pandao-sprite.png";
  const style: CSSProperties = {
    width,
    height: Math.round(sourceHeight * scale),
    backgroundImage: "url(\"" + spriteUrl + "\")",
    backgroundRepeat: "no-repeat",
    backgroundSize: Math.round(1254 * scale) + "px " + Math.round(1254 * scale) + "px",
    backgroundPosition: Math.round(-x * scale) + "px " + Math.round(-y * scale) + "px",
  };
  return <div className={"mascot " + className} style={style} role="img" aria-label={label} />;
}
