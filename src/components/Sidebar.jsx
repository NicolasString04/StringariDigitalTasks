import { NavLink } from "react-router-dom";
import {
  House,
  Folder,
  SquareCheckBig,
} from "lucide-react";

import "../styles/sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* MARCA */}
      <div className="sidebar-brand">

        <img
          src="/images/logo.png"
          alt="Stringari Digital"
          className="sidebar-logo"
        />

        <div className="sidebar-brand-line" />

        <span className="sidebar-product-name">
          TASKS
        </span>

      </div>

      {/* NAVEGAÇÃO */}
      <nav className="sidebar-nav">

        <NavLink
          to="/home"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <House size={20} />
          <span>Início</span>
        </NavLink>

        <NavLink
          to="/projetos"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <Folder size={20} />
          <span>Projetos</span>
        </NavLink>

        <NavLink
          to="/tarefas"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <SquareCheckBig size={20} />
          <span>Tarefas</span>
        </NavLink>

      </nav>

      {/* PERFIL */}
      <div className="sidebar-footer">

        <div className="footer-avatar">
          SD
        </div>

        <div className="footer-user-info">
          <strong>
            Stringari Digital
          </strong>

          <span>
            Foco em resultado.
          </span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;