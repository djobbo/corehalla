import React from "react";
import { Link } from "react-router-dom";

import "./styles.scss";

import Icon from "@mdi/react";
import { mdiMagnify, mdiDiscord } from "@mdi/js";

import Logo from "../../App/logo.png";

const TopBar: React.FC = () => {
  return (
    <div className="topbar">
      <div className="topbar-nav">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="Logo" />
          </Link>
        </div>
        <div className="searchbox">
          <i>
            <Icon path={mdiMagnify} title="Discord" size={1} />
          </i>
          <input type="text" placeholder="Search Player..." />
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/rankings">Rankings</Link>
            </li>
            <li>
              <a href="/">
                <Icon
                  path={mdiDiscord}
                  title="Discord"
                  size={1}
                />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TopBar;
