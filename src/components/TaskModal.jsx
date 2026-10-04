import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Trash2,
} from "lucide-react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

function TaskModal({
  project,
  task,
  defaultStatus,
  onClose,
}) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState(
    defaultStatus
  );

  const [
    priority,
    setPriority,
  ] = useState(
    "Média"
  );

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const isEditing =
    Boolean(task);

  /*
   * =========================
   * CARREGAR TAREFA
   * =========================
   */

  useEffect(() => {
    if (task) {
      setTitle(
        task.title || ""
      );

      setDescription(
        task.description ||
        ""
      );

      setStatus(
        task.status ||
        defaultStatus
      );

      setPriority(
        task.priority ||
        "Média"
      );

      setDueDate(
        task.dueDate || ""
      );

      return;
    }

    setTitle("");

    setDescription("");

    setStatus(
      defaultStatus
    );

    setPriority(
      "Média"
    );

    setDueDate("");
  }, [
    task,
    defaultStatus,
  ]);

  /*
   * =========================
   * CRIAR / EDITAR
   * =========================
   */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!title.trim()) {
      alert(
        "Informe o título da tarefa."
      );

      return;
    }

    const user =
      auth.currentUser;

    if (!user) {
      alert(
        "Você precisa estar logado."
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * EDITAR
       */
      if (isEditing) {
        await updateDoc(
          doc(
            db,
            "tasks",
            task.id
          ),

          {
            title:
              title.trim(),

            description:
              description.trim(),

            status,

            priority,

            dueDate,

            updatedAt:
              serverTimestamp(),
          }
        );
      } else {
        /*
         * CRIAR
         */
        await addDoc(
          collection(
            db,
            "tasks"
          ),

          {
            projectId:
              project.id,

            ownerId:
              user.uid,

            ownerEmail:
              user.email,

            ownerName:
              user.displayName ||
              user.email,

            title:
              title.trim(),

            description:
              description.trim(),

            status,

            priority,

            dueDate,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );
      }

      onClose();
    } catch (error) {
      console.error(
        "Erro ao salvar tarefa:",
        error
      );

      alert(
        "Não foi possível salvar a tarefa."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================
   * EXCLUIR
   * =========================
   */

  async function handleDelete() {
    if (!task) {
      return;
    }

    const confirmed =
      window.confirm(
        `Excluir a tarefa "${task.title}"?\n\nEssa ação não poderá ser desfeita.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteDoc(
        doc(
          db,
          "tasks",
          task.id
        )
      );

      onClose();
    } catch (error) {
      console.error(
        "Erro ao excluir tarefa:",
        error
      );

      alert(
        "Não foi possível excluir a tarefa."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="task-modal-overlay"
      onMouseDown={() => {
        if (!saving) {
          onClose();
        }
      }}
    >

      <form
        className="task-modal"
        onSubmit={
          handleSubmit
        }
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="task-modal-header">

          <div>

            <span>
              {project.name}
            </span>

            <h2>
              {isEditing
                ? "Editar tarefa"
                : "Nova tarefa"}
            </h2>

          </div>

          <button
            type="button"
            className="task-modal-close"
            onClick={
              onClose
            }
            disabled={
              saving
            }
          >

            <X
              size={21}
            />

          </button>

        </div>

        {/* TÍTULO */}

        <div className="task-modal-field">

          <label
            htmlFor="task-title"
          >
            Título
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="Ex: Criar página inicial"
            value={
              title
            }
            onChange={(
              event
            ) =>
              setTitle(
                event
                  .target
                  .value
              )
            }
            autoFocus
            disabled={
              saving
            }
          />

        </div>

        {/* DESCRIÇÃO */}

        <div className="task-modal-field">

          <label
            htmlFor="task-description"
          >
            Descrição
          </label>

          <textarea
            id="task-description"
            placeholder="Descreva o que precisa ser feito..."
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event
                  .target
                  .value
              )
            }
            disabled={
              saving
            }
          />

        </div>

        {/* FASE + PRIORIDADE */}

        <div className="task-modal-row">

          <div className="task-modal-field">

            <label
              htmlFor="task-status"
            >
              Fase
            </label>

            <select
              id="task-status"
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event
                    .target
                    .value
                )
              }
              disabled={
                saving
              }
            >

              <option value="todo">
                A Fazer
              </option>

              <option value="doing">
                Em andamento
              </option>

              <option value="review">
                Em revisão
              </option>

              <option value="done">
                Concluído
              </option>

            </select>

          </div>

          <div className="task-modal-field">

            <label
              htmlFor="task-priority"
            >
              Prioridade
            </label>

            <select
              id="task-priority"
              value={
                priority
              }
              onChange={(
                event
              ) =>
                setPriority(
                  event
                    .target
                    .value
                )
              }
              disabled={
                saving
              }
            >

              <option value="Baixa">
                Baixa
              </option>

              <option value="Média">
                Média
              </option>

              <option value="Alta">
                Alta
              </option>

            </select>

          </div>

        </div>

        {/* PRAZO */}

        <div className="task-modal-field">

          <label
            htmlFor="task-date"
          >
            Prazo
          </label>

          <input
            id="task-date"
            type="date"
            value={
              dueDate
            }
            onChange={(
              event
            ) =>
              setDueDate(
                event
                  .target
                  .value
              )
            }
            disabled={
              saving
            }
          />

        </div>

        {/* AÇÕES */}

        <div className="task-modal-actions">

          <div>

            {isEditing && (

              <button
                type="button"
                className="task-delete-button"
                onClick={
                  handleDelete
                }
                disabled={
                  saving
                }
              >

                <Trash2
                  size={17}
                />

                Excluir

              </button>

            )}

          </div>

          <div className="task-modal-main-actions">

            <button
              type="button"
              className="task-cancel-button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="task-save-button"
              disabled={
                saving
              }
            >

              {saving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar tarefa"}

            </button>

          </div>

        </div>

      </form>

    </div>
  );
}

export default TaskModal;