import Logo from "@/assets/boayo-logo-1.svg";
import type { HTMLAttributes } from "react";

type EmptyLogoProps = Pick<HTMLAttributes<HTMLDivElement>, "className">;

export default function EmptyLogo({ className = "" }: EmptyLogoProps) {
  return (
    <div
      className={`flex pointer-events-none flex-col justify-center pb-[100px] gap-10 ${className}`}
    >
      <div className="flex justify-center">
        <img src={Logo} alt="Boayo logo" className="w-xs" />
      </div>
      <div className="flex flex-col gap-4 text-2xl text-gray-400 font-semibold text-center">
        <p>Drop drectory here to open</p>
        <p>
          Press <kbd>F1</kbd> to toggle cheatsheet
        </p>
      </div>
    </div>
  );
}
