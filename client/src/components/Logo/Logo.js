import React from "react";
import logoScuro from "../../assets/images/logo_sfondo_scuro.svg";
import logoChiaro from "../../assets/images/logo_sfondo_chiaro.svg";

export default function Logo() {
  // return <div className="rounded-full bg-slate-500 w-12 flex justify-center items-center">Logo</div>;
  return (
    // <div className="bg-text rounded pl-2 pr-2 py-1">
    //   <img className="h-8" src={logoChiaro} alt="logo" />
    // </div>
    <img className="h-10" src={logoScuro} alt="logo" />
  );
}