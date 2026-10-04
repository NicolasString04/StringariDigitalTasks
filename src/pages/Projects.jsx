import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  Plus,
  FolderPlus,
  X,
} from "lucide-react";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import AppLayout from "../components/AppLayout";
import ProjectCard from "../components/ProjectCard";
import ProjectWorkspace from "../components/ProjectWorkspace";

import {
  auth,
  db,
} from "../firebase/firebase";

import "../styles/projects.css";

function Projects() {
  /*
   * =========================
   * ESTADOS
   * =========================
   */

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    projectsLoading,
    setProjectsLoading,
  ] = useState(true);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState(
    "Em planejamento"
  );

  const [
    creating,
    setCreating,
  ] = useState(false);

  /*
   * Guarda somente o ID.
   *
   * Assim, quando o Firestore atualizar
   * tasks/progress do projeto, o workspace
   * também recebe a versão nova.
   */
  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(null);

  const selectedProject =
    projects.find(
      (project) =>
        project.id ===
        selectedProjectId
    ) || null;

  /*
   * =========================
   * AUTENTICAÇÃO
   * =========================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(
            firebaseUser
          );

          setAuthLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /*
   * =========================
   * PROJETOS DO FIREBASE
   * =========================
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProjects([]);

      setProjectsLoading(
        false
      );

      return;
    }

    setProjectsLoading(true);

    const projectsQuery =
      query(
        collection(
          db,
          "projects"
        ),

        where(
          "ownerId",
          "==",
          user.uid
        )
      );

    const unsubscribe =
      onSnapshot(
        projectsQuery,

        (snapshot) => {
          const projectList =
            snapshot.docs.map(
              (
                projectDocument
              ) => ({
                id:
                  projectDocument.id,

                ...projectDocument.data(),
              })
            );

          /*
           * Mais recentes primeiro.
           */
          projectList.sort(
            (
              projectA,
              projectB
            ) => {
              const dateA =
                projectA
                  .createdAt
                  ?.seconds || 0;

              const dateB =
                projectB
                  .createdAt
                  ?.seconds || 0;

              return (
                dateB -
                dateA
              );
            }
          );

          setProjects(
            projectList
          );

          setProjectsLoading(
            false
          );
        },

        (error) => {
          console.error(
            "Erro ao carregar projetos:",
            error
          );

          setProjectsLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, [
    user,
    authLoading,
  ]);

  /*
   * =========================
   * MODAL NOVO PROJETO
   * =========================
   */

  function openProjectModal() {
    setName("");

    setDescription("");

    setStatus(
      "Em planejamento"
    );

    setShowModal(true);
  }

  function closeProjectModal() {
    if (creating) {
      return;
    }

    setShowModal(false);
  }

  /*
   * =========================
   * CRIAR PROJETO
   * =========================
   */

  async function handleCreateProject(
    event
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert(
        "Informe o nome do projeto."
      );

      return;
    }

    if (!user) {
      alert(
        "Você precisa estar logado."
      );

      return;
    }

    try {
      setCreating(true);

      await addDoc(
        collection(
          db,
          "projects"
        ),

        {
          name:
            name.trim(),

          description:
            description.trim(),

          status,

          /*
           * Estes valores passam a ser
           * atualizados automaticamente
           * pelas tarefas.
           */
          progress: 0,

          tasks: 0,

          ownerId:
            user.uid,

          ownerEmail:
            user.email,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setName("");

      setDescription("");

      setStatus(
        "Em planejamento"
      );

      setShowModal(false);
    } catch (error) {
      console.error(
        "Erro ao criar projeto:",
        error
      );

      alert(
        "Não foi possível criar o projeto."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * =========================
   * EXCLUIR PROJETO
   *
   * Também exclui todas as
   * tarefas daquele projeto.
   * =========================
   */

  async function handleDeleteProject(
    project
  ) {
    const confirmed =
      window.confirm(
        `Tem certeza que deseja excluir o projeto "${project.name}"?\n\nTodas as tarefas deste projeto também serão excluídas. Essa ação não poderá ser desfeita.`
      );

    if (!confirmed) {
      return;
    }

    try {
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

      const tasksSnapshot =
        await getDocs(
          tasksQuery
        );

      const batch =
        writeBatch(db);

      /*
       * Apaga todas as tarefas.
       */
      tasksSnapshot.forEach(
        (
          taskDocument
        ) => {
          batch.delete(
            taskDocument.ref
          );
        }
      );

      /*
       * Apaga o projeto.
       */
      batch.delete(
        doc(
          db,
          "projects",
          project.id
        )
      );

      await batch.commit();

      /*
       * Caso o projeto estivesse aberto.
       */
      if (
        selectedProjectId ===
        project.id
      ) {
        setSelectedProjectId(
          null
        );
      }
    } catch (error) {
      console.error(
        "Erro ao excluir projeto:",
        error
      );

      alert(
        "Não foi possível excluir o projeto."
      );
    }
  }

  /*
   * =========================
   * BUSCA
   * =========================
   */

  const filteredProjects =
    projects.filter(
      (project) => {
        const projectName =
          project.name
            ?.toLowerCase() ||
          "";

        const term =
          search
            .trim()
            .toLowerCase();

        return projectName.includes(
          term
        );
      }
    );

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <AppLayout>

      <div className="projects-page">

        {/* HEADER */}

        <header className="projects-header">

          <div>

            <h1>
              Projetos
            </h1>

            <p>
              Seus projetos,
              em um só lugar.
            </p>

          </div>

          <span className="projects-quote">
            Construa hoje um futuro extraordinário.
          </span>

        </header>

        {/* TOOLBAR */}

        <div className="projects-toolbar">

          <div className="projects-search">

            <Search
              size={20}
            />

            <input
              type="text"
              placeholder="Buscar projetos..."
              value={search}
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
            className="new-project-button"
            onClick={
              openProjectModal
            }
          >

            <Plus
              size={20}
            />

            Novo projeto

          </button>

        </div>

        {/* LOADING */}

        {projectsLoading ? (

          <div className="projects-loading">

            Carregando projetos...

          </div>

        ) : projects.length ===
          0 ? (

          /* ESTADO VAZIO */

          <section className="projects-empty-state">

            <div className="projects-empty-icon">

              <FolderPlus
                size={34}
              />

            </div>

            <h2>
              Nenhum projeto
              por aqui ainda.
            </h2>

            <p>
              Crie seu primeiro
              projeto para começar.
            </p>

            <button
              type="button"
              className="empty-create-button"
              onClick={
                openProjectModal
              }
            >

              <Plus
                size={18}
              />

              Criar primeiro projeto

            </button>

          </section>

        ) : filteredProjects.length ===
          0 ? (

          /* BUSCA SEM RESULTADO */

          <div className="projects-empty">

            <h2>
              Nenhum projeto encontrado.
            </h2>

            <p>
              Tente pesquisar
              por outro nome.
            </p>

          </div>

        ) : (

          /* GRID */

          <section className="projects-grid">

            {filteredProjects.map(
              (project) => (

                <ProjectCard
                  key={
                    project.id
                  }
                  project={
                    project
                  }
                  onDelete={
                    handleDeleteProject
                  }
                  onOpen={(
                    selected
                  ) =>
                    setSelectedProjectId(
                      selected.id
                    )
                  }
                />

              )
            )}

          </section>

        )}

      </div>

      {/* =====================
          MODAL NOVO PROJETO
      ====================== */}

      {showModal && (

        <div
          className="project-modal-overlay"
          onMouseDown={
            closeProjectModal
          }
        >

          <form
            className="project-modal"
            onSubmit={
              handleCreateProject
            }
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="project-modal-header">

              <div>

                <h2>
                  Novo projeto
                </h2>

                <p>
                  Crie um novo espaço
                  de trabalho.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeProjectModal
                }
                disabled={
                  creating
                }
              >

                <X
                  size={21}
                />

              </button>

            </div>

            {/* NOME */}

            <div className="project-modal-field">

              <label
                htmlFor="project-name"
              >
                Nome do projeto
              </label>

              <input
                id="project-name"
                type="text"
                placeholder="Ex: Mentria"
                value={name}
                onChange={(
                  event
                ) =>
                  setName(
                    event
                      .target
                      .value
                  )
                }
                autoFocus
                disabled={
                  creating
                }
              />

            </div>

            {/* DESCRIÇÃO */}

            <div className="project-modal-field">

              <label
                htmlFor="project-description"
              >
                Descrição
              </label>

              <textarea
                id="project-description"
                placeholder="Uma breve descrição do projeto..."
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
                  creating
                }
              />

            </div>

            {/* STATUS */}

            <div className="project-modal-field">

              <label
                htmlFor="project-status"
              >
                Status
              </label>

              <select
                id="project-status"
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
                  creating
                }
              >

                <option value="Em planejamento">
                  Em planejamento
                </option>

                <option value="Em andamento">
                  Em andamento
                </option>

                <option value="Em revisão">
                  Em revisão
                </option>

                <option value="Concluído">
                  Concluído
                </option>

              </select>

            </div>

            {/* AÇÕES */}

            <div className="project-modal-actions">

              <button
                type="button"
                className="modal-cancel"
                onClick={
                  closeProjectModal
                }
                disabled={
                  creating
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="modal-create"
                disabled={
                  creating
                }
              >

                {creating
                  ? "Criando..."
                  : "Criar projeto"}

              </button>

            </div>

          </form>

        </div>

      )}

      {/* =====================
          WORKSPACE
      ====================== */}

      {selectedProject && (

        <ProjectWorkspace
          project={
            selectedProject
          }
          onClose={() =>
            setSelectedProjectId(
              null
            )
          }
        />

      )}

    </AppLayout>
  );
}

export default Projects;