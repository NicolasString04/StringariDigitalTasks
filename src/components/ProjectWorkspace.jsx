import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  Search,
  Plus,
  Folder,
  SquareCheckBig,
  CalendarDays,
} from "lucide-react";

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import TaskModal from "./TaskModal";

import "../styles/workspace.css";

const COLUMNS = [
  {
    id: "todo",
    title: "A Fazer",
  },

  {
    id: "doing",
    title: "Em andamento",
  },

  {
    id: "review",
    title: "Em revisão",
  },

  {
    id: "done",
    title: "Concluído",
  },
];

function ProjectWorkspace({
  project,
  onClose,
}) {
  const [
    tasks,
    setTasks,
  ] = useState([]);

  const [
    tasksLoaded,
    setTasksLoaded,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showTaskModal,
    setShowTaskModal,
  ] = useState(false);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  const [
    defaultStatus,
    setDefaultStatus,
  ] = useState("todo");

  const [
    draggingTaskId,
    setDraggingTaskId,
  ] = useState(null);

  const [
    dragOverStatus,
    setDragOverStatus,
  ] = useState(null);

  /*
   * =========================
   * BLOQUEAR SCROLL DA PÁGINA
   * =========================
   */

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previousOverflow;
    };
  }, []);

  /*
   * =========================
   * TAREFAS DO PROJETO
   * =========================
   */

  useEffect(() => {
    setTasksLoaded(false);

    const tasksQuery =
      query(
        collection(
          db,
          "tasks"
        ),

        where(
          "projectId",
          "==",
          project.id
        )
      );

    const unsubscribe =
      onSnapshot(
        tasksQuery,

        (snapshot) => {
          const taskList =
            snapshot.docs.map(
              (
                taskDocument
              ) => ({
                id:
                  taskDocument.id,

                ...taskDocument.data(),
              })
            );

          taskList.sort(
            (
              taskA,
              taskB
            ) => {
              const dateA =
                taskA.createdAt
                  ?.seconds || 0;

              const dateB =
                taskB.createdAt
                  ?.seconds || 0;

              return (
                dateA -
                dateB
              );
            }
          );

          setTasks(
            taskList
          );

          setTasksLoaded(
            true
          );
        },

        (error) => {
          console.error(
            "Erro ao carregar tarefas:",
            error
          );

          setTasksLoaded(
            true
          );
        }
      );

    return () =>
      unsubscribe();
  }, [
    project.id,
  ]);

  /*
   * =========================
   * ESTATÍSTICAS
   * =========================
   */

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "done"
    ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (
            completedTasks /
            totalTasks
          ) *
            100
        );

  /*
   * =========================
   * SINCRONIZA PROJETO
   *
   * Se tarefas mudarem:
   * tasks e progress do projeto
   * também mudam.
   * =========================
   */

  useEffect(() => {
    if (!tasksLoaded) {
      return;
    }

    const currentTasks =
      project.tasks || 0;

    const currentProgress =
      project.progress || 0;

    if (
      currentTasks ===
        totalTasks &&
      currentProgress ===
        progress
    ) {
      return;
    }

    async function syncProjectStats() {
      try {
        await updateDoc(
          doc(
            db,
            "projects",
            project.id
          ),

          {
            tasks:
              totalTasks,

            progress,

            updatedAt:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(
          "Erro ao atualizar estatísticas do projeto:",
          error
        );
      }
    }

    syncProjectStats();
  }, [
    tasksLoaded,
    totalTasks,
    progress,
    project.id,
    project.tasks,
    project.progress,
  ]);

  /*
   * =========================
   * BUSCA
   * =========================
   */

  const filteredTasks =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return tasks;
        }

        return tasks.filter(
          (task) => {
            const title =
              task.title
                ?.toLowerCase() ||
              "";

            const description =
              task.description
                ?.toLowerCase() ||
              "";

            return (
              title.includes(
                term
              ) ||
              description.includes(
                term
              )
            );
          }
        );
      },
      [
        tasks,
        search,
      ]
    );

  /*
   * =========================
   * NOVA TAREFA
   * =========================
   */

  function openNewTask(
    status = "todo"
  ) {
    setSelectedTask(
      null
    );

    setDefaultStatus(
      status
    );

    setShowTaskModal(
      true
    );
  }

  /*
   * =========================
   * EDITAR TAREFA
   * =========================
   */

  function openTask(
    task
  ) {
    setSelectedTask(
      task
    );

    setDefaultStatus(
      task.status
    );

    setShowTaskModal(
      true
    );
  }

  /*
   * =========================
   * DRAG AND DROP
   * =========================
   */

  function handleDragStart(
    event,
    task
  ) {
    event.dataTransfer
      .setData(
        "text/plain",
        task.id
      );

    event.dataTransfer
      .effectAllowed =
      "move";

    setDraggingTaskId(
      task.id
    );
  }

  function handleDragEnd() {
    setDraggingTaskId(
      null
    );

    setDragOverStatus(
      null
    );
  }

  function handleDragOver(
    event,
    status
  ) {
    event.preventDefault();

    event.dataTransfer
      .dropEffect =
      "move";

    setDragOverStatus(
      status
    );
  }

  async function handleDrop(
    event,
    newStatus
  ) {
    event.preventDefault();

    const taskId =
      event.dataTransfer
        .getData(
          "text/plain"
        ) ||
      draggingTaskId;

    setDragOverStatus(
      null
    );

    setDraggingTaskId(
      null
    );

    if (!taskId) {
      return;
    }

    const task =
      tasks.find(
        (item) =>
          item.id ===
          taskId
      );

    if (
      !task ||
      task.status ===
        newStatus
    ) {
      return;
    }

    /*
     * Atualiza visualmente
     * antes mesmo do Firebase.
     */
    setTasks(
      (
        currentTasks
      ) =>
        currentTasks.map(
          (item) =>
            item.id ===
            taskId
              ? {
                  ...item,
                  status:
                    newStatus,
                }
              : item
        )
    );

    try {
      await updateDoc(
        doc(
          db,
          "tasks",
          taskId
        ),

        {
          status:
            newStatus,

          updatedAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(
        "Erro ao mover tarefa:",
        error
      );
    }
  }

  /*
   * =========================
   * FORMATA DATA
   * =========================
   */

  function formatDate(
    date
  ) {
    if (!date) {
      return null;
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "pt-BR",

      {
        day: "2-digit",

        month:
          "short",
      }
    );
  }

  /*
   * =========================
   * INICIAIS
   * =========================
   */

  function getInitials(
    task
  ) {
    const name =
      task.ownerName ||
      auth.currentUser
        ?.displayName ||
      auth.currentUser
        ?.email ||
      "SD";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]
            ?.toUpperCase()
      )
      .join("");
  }

  return (
    <div className="project-workspace">

      <div className="workspace-shell">

        {/* =====================
            HEADER
        ====================== */}

        <header className="workspace-header">

          <div className="workspace-project">

            <div className="workspace-project-icon">

              <Folder
                size={30}
              />

            </div>

            <div>

              <h1>
                {project.name}
              </h1>

              <p>
                {project.description ||
                  "Sem descrição."}
              </p>

            </div>

          </div>

          <div className="workspace-header-right">

            <div className="workspace-stat">

              <SquareCheckBig
                size={19}
              />

              <div>

                <strong>
                  {completedTasks}/
                  {totalTasks}
                </strong>

                <span>
                  concluídas
                </span>

              </div>

            </div>

            <div className="workspace-progress-number">

              {progress}%

            </div>

            <button
              type="button"
              className="workspace-close"
              onClick={
                onClose
              }
              title="Fechar projeto"
            >

              <X
                size={24}
              />

            </button>

          </div>

        </header>

        {/* =====================
            ÁREA TAREFAS
        ====================== */}

        <div className="workspace-section-title">

          <SquareCheckBig
            size={19}
          />

          <strong>
            Tarefas
          </strong>

        </div>

        {/* =====================
            TOOLBAR
        ====================== */}

        <div className="workspace-toolbar">

          <div className="workspace-search">

            <Search
              size={20}
            />

            <input
              type="text"
              placeholder="Buscar tarefas deste projeto..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
            />

          </div>

          <button
            type="button"
            className="workspace-new-task"
            onClick={() =>
              openNewTask(
                "todo"
              )
            }
          >

            <Plus
              size={19}
            />

            Nova tarefa

          </button>

        </div>

        {/* =====================
            KANBAN
        ====================== */}

        <div className="kanban-board">

          {COLUMNS.map(
            (
              column
            ) => {
              const columnTasks =
                filteredTasks.filter(
                  (task) =>
                    task.status ===
                    column.id
                );

              return (
                <section
                  key={
                    column.id
                  }
                  className={
                    `kanban-column kanban-${column.id} ${
                      dragOverStatus ===
                      column.id
                        ? "drag-over"
                        : ""
                    }`
                  }
                  onDragOver={(
                    event
                  ) =>
                    handleDragOver(
                      event,
                      column.id
                    )
                  }
                  onDragLeave={() =>
                    setDragOverStatus(
                      null
                    )
                  }
                  onDrop={(
                    event
                  ) =>
                    handleDrop(
                      event,
                      column.id
                    )
                  }
                >

                  {/* HEADER COLUNA */}

                  <div className="kanban-column-header">

                    <div>

                      <span className="kanban-status-dot" />

                      <h2>
                        {
                          column.title
                        }
                      </h2>

                    </div>

                    <span className="kanban-count">

                      {
                        columnTasks.length
                      }

                    </span>

                  </div>

                  {/* ADICIONAR */}

                  <button
                    type="button"
                    className="kanban-add-task"
                    onClick={() =>
                      openNewTask(
                        column.id
                      )
                    }
                  >

                    <Plus
                      size={17}
                    />

                    Adicionar tarefa

                  </button>

                  {/* CARDS */}

                  <div className="kanban-column-tasks">

                    {columnTasks.map(
                      (task) => (

                        <article
                          key={
                            task.id
                          }
                          className={
                            `kanban-task ${
                              draggingTaskId ===
                              task.id
                                ? "dragging"
                                : ""
                            }`
                          }
                          draggable
                          onDragStart={(
                            event
                          ) =>
                            handleDragStart(
                              event,
                              task
                            )
                          }
                          onDragEnd={
                            handleDragEnd
                          }
                          onClick={() =>
                            openTask(
                              task
                            )
                          }
                        >

                          <h3>
                            {
                              task.title
                            }
                          </h3>

                          {task.description && (

                            <p>
                              {
                                task.description
                              }
                            </p>

                          )}

                          <div className="kanban-task-footer">

                            <span
                              className={
                                `task-priority priority-${
                                  task.priority ||
                                  "Média"
                                }`
                              }
                            >

                              {task.priority ||
                                "Média"}

                            </span>

                            {task.dueDate && (

                              <span className="task-date">

                                <CalendarDays
                                  size={15}
                                />

                                {formatDate(
                                  task.dueDate
                                )}

                              </span>

                            )}

                            <span className="task-avatar">

                              {getInitials(
                                task
                              )}

                            </span>

                          </div>

                        </article>

                      )
                    )}

                    {columnTasks.length ===
                      0 && (

                      <div className="kanban-empty">

                        Nenhuma tarefa

                      </div>

                    )}

                  </div>

                </section>
              );
            }
          )}

        </div>

      </div>

      {/* =====================
          MODAL TAREFA
      ====================== */}

      {showTaskModal && (

        <TaskModal
          project={
            project
          }
          task={
            selectedTask
          }
          defaultStatus={
            defaultStatus
          }
          onClose={() => {
            setShowTaskModal(
              false
            );

            setSelectedTask(
              null
            );
          }}
        />

      )}

    </div>
  );
}

export default ProjectWorkspace;