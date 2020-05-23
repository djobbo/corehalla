import React from "react";
import "./styles.scss";

const Loader: React.FC = () => (
  <div className="loader">
    <div className="lds-ellipsis">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);

export default Loader;
