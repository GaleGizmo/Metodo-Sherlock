import React from "react";

export default function Header({ title, logo, caseNumber }) {
  return (
    <div className="top-bar">
      <div className="title">{caseNumber}</div>
      {/* <div className="title">{title}</div> */}
      <div className="logo-slot">
        <img src={logo} alt="logo" />
      </div>
    </div>
  );
}
