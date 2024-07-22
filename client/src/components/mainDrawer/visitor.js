import React from "react";
import HeaderVisitor from "../header/headerVisitor";
import FooterVisitor from "../footer/footerVisitor";

const Visitor = ({ children }) => {
  return (
    <div>
      <HeaderVisitor />
      {children}
      <FooterVisitor />
    </div>
  );
};

export default Visitor;
