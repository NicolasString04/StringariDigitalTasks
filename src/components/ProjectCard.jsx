import {
  Folder,
  CheckSquare,
  Trash2,
} from "lucide-react";

function ProjectCard({
  project,
  onDelete,
  onOpen,
}) {
  /*
   * Define a classe visual
   * do status.
   */
  function getStatusClass() {
    switch (
      project.status
    ) {
      case "Em andamento":
        return "active";

      case "Em revisão":
        return "review";

      case "Concluído":
        return "completed";

      case "Em planejamento":
      default:
        return "planning";
    }
  }

  /*
   * Excluir sem abrir o projeto.
   */
  function handleDeleteClick(
    event
  ) {
    event.stopPropagation();

    onDelete(project);
  }

  /*
   * Acessibilidade pelo teclado.
   */
  function handleKeyDown(
    event
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      onOpen(project);
    }
  }

  return (
    <article
      className="project-card project-card-clickable"
      onClick={() =>
        onOpen(project)
      }
      onKeyDown={
        handleKeyDown
      }
      role="button"
      tabIndex={0}
    >

      {/* TOPO */}

      <div className="project-card-top">

        <div className="project-info">

          <div className="project-icon">

            <Folder
              size={27}
            />

          </div>

          <div>

            <h2>
              {project.name}
            </h2>

            <p>
              {project.description ||
                "Sem descrição."}
            </p>

          </div>

        </div>

        {/* STATUS + EXCLUIR */}

        <div className="project-card-actions">

          <span
            className={
              `project-status ${getStatusClass()}`
            }
          >

            <span className="status-dot" />

            {project.status}

          </span>

          <button
            type="button"
            className="project-delete-button"
            title="Excluir projeto"
            aria-label={
              `Excluir projeto ${project.name}`
            }
            onClick={
              handleDeleteClick
            }
          >

            <Trash2
              size={18}
            />

          </button>

        </div>

      </div>

      {/* PROGRESSO */}

      <div className="project-progress-area">

        <div className="project-progress">

          <div
            className="project-progress-fill"
            style={{
              width:
                `${project.progress || 0}%`,
            }}
          />

        </div>

        <span>
          {project.progress || 0}%
        </span>

      </div>

      {/* RODAPÉ */}

      <div className="project-card-footer">

        <div className="project-footer-item">

          <CheckSquare
            size={18}
          />

          <span>
            {project.tasks || 0}
            {" "}
            tarefas
          </span>

        </div>

      </div>

    </article>
  );
}

export default ProjectCard;