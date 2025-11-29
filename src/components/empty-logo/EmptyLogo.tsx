import Logo from "@/assets/boayo-logo-1.svg";
import type { HTMLAttributes } from "react";

type EmptyLogoProps = Pick<HTMLAttributes<HTMLDivElement>, "className">;

export default function EmptyLogo({ className = "" }: EmptyLogoProps) {
  return (
    <div
      className={`flex pointer-events-none flex-col justify-center pb-[100px] gap-8 ${className}`}
    >
      <div className="flex justify-center">
        <img src={Logo} alt="Boayo logo" className="w-xs" />
      </div>
      <p className="text-2xl text-gray-400 font-semibold text-center">
        Drop drectory here to open
      </p>
    </div>
  );
}
