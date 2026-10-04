import {
  useEffect,
  useState,
} from "react";

import {
  Folder,
  SquareCheckBig,
  ArrowRight,
  Plus,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  auth,
  db,
} from "../firebase/firebase";

import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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
          if (!firebaseUser) {
            navigate("/login");

            return;
          }

          setUser(firebaseUser);
        }
      );

    return () =>
      unsubscribe();
  }, [navigate]);

  /*
   * =========================
   * PROJETOS DO USUÁRIO
   * =========================
   */

  useEffect(() => {
    if (!user) {
      return;
    }

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
              (projectDocument) => ({
                id:
                  projectDocument.id,

                ...projectDocument.data(),
              })
            );

          /*
           * Mais novos primeiro.
           */
          projectList.sort(
            (
              projectA,
              projectB
            ) => {
              const dateA =
                projectA.createdAt
                  ?.seconds || 0;

              const dateB =
                projectB.createdAt
                  ?.seconds || 0;

              return (
                dateB - dateA
              );
            }
          );

          setProjects(
            projectList
          );

          setLoading(false);
        },

        (error) => {
          console.error(
            "Erro ao carregar projetos:",
            error
          );

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, [user]);

  /*
   * =========================
   * DADOS DA HOME
   * =========================
   */

  const totalProjects =
    projects.length;

  const totalTasks =
    projects.reduce(
      (
        total,
        project
      ) =>
        total +
        (
          project.tasks ||
          0
        ),
      0
    );

  const recentProjects =
    projects.slice(
      0,
      3
    );

  /*
   * =========================
   * NOME
   * =========================
   */

  const firstName =
    user?.displayName
      ?.split(" ")[0] ||
    "Nicolas";

  /*
   * =========================
   * STATUS VISUAL
   * =========================
   */

  function getStatusClass(
    status
  ) {
    switch (status) {
      case "Em andamento":
        return "active";

      case "Em revisão":
        return "review";

      case "Concluído":
        return "completed";

      default:
        return "planning";
    }
  }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <AppLayout>
        <div className="home-loading">
          Carregando...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <div className="home-page">

        {/* CABEÇALHO */}

        <header className="home-header">

          <div>

            <p className="home-welcome">
              Bem-vindo de volta,
            </p>

            <h1>
              {firstName}
              <span>.</span>
            </h1>

            <p className="home-subtitle">
              Seus projetos e tarefas,
              em um só lugar.
            </p>

          </div>

          <span className="home-quote">
            Construa hoje um futuro
            extraordinário.
          </span>

        </header>

        {/* RESUMO */}

        <section className="home-summary">

          {/* PROJETOS */}

          <Link
            to="/projetos"
            className="home-summary-card"
          >

            <div className="home-summary-icon">
              <Folder
                size={28}
              />
            </div>

            <div className="home-summary-content">

              <span>
                Projetos
              </span>

              <div className="home-summary-number">

                <strong>
                  {totalProjects}
                </strong>

                <p>
                  {totalProjects === 1
                    ? "projeto ativo"
                    : "projetos ativos"}
                </p>

              </div>

              <div className="home-summary-line">
                <div
                  style={{
                    width:
                      totalProjects >
                      0
                        ? "70%"
                        : "0%",
                  }}
                />
              </div>

            </div>

            <div className="home-summary-arrow">
              <ArrowRight
                size={20}
              />
            </div>

          </Link>

          {/* TAREFAS */}

          <Link
            to="/tarefas"
            className="home-summary-card"
          >

            <div className="home-summary-icon">
              <SquareCheckBig
                size={28}
              />
            </div>

            <div className="home-summary-content">

              <span>
                Tarefas
              </span>

              <div className="home-summary-number">

                <strong>
                  {totalTasks}
                </strong>

                <p>
                  {totalTasks === 1
                    ? "tarefa no total"
                    : "tarefas no total"}
                </p>

              </div>

              <div className="home-summary-line">
                <div
                  style={{
                    width:
                      totalTasks >
                      0
                        ? "55%"
                        : "0%",
                  }}
                />
              </div>

            </div>

            <div className="home-summary-arrow">
              <ArrowRight
                size={20}
              />
            </div>

          </Link>

        </section>

        {/* PROJETOS RECENTES */}

        <section className="home-projects-section">

          <div className="home-section-header">

            <div>

              <h2>
                Projetos recentes
              </h2>

              <p>
                Continue de onde
                você parou.
              </p>

            </div>

            {projects.length >
              0 && (
              <Link
                to="/projetos"
                className="home-view-all"
              >
                Ver todos

                <ArrowRight
                  size={17}
                />
              </Link>
            )}

          </div>

          {/* SEM PROJETOS */}

          {recentProjects.length ===
          0 ? (

            <div className="home-empty-projects">

              <div className="home-empty-icon">
                <Folder
                  size={32}
                />
              </div>

              <h3>
                Nenhum projeto ainda.
              </h3>

              <p>
                Crie seu primeiro
                projeto para começar.
              </p>

              <Link
                to="/projetos"
                className="home-create-project"
              >

                <Plus
                  size={18}
                />

                Criar projeto

              </Link>

            </div>

          ) : (

            <div className="home-projects-grid">

              {recentProjects.map(
                (project) => (

                  <article
                    key={
                      project.id
                    }
                    className="home-project-card"
                  >

                    <div className="home-project-top">

                      <div className="home-project-icon">

                        <Folder
                          size={24}
                        />

                      </div>

                      <span
                        className={
                          `home-project-status ${getStatusClass(
                            project.status
                          )}`
                        }
                      >

                        <span />

                        {
                          project.status
                        }

                      </span>

                    </div>

                    <h3>
                      {
                        project.name
                      }
                    </h3>

                    <p className="home-project-description">

                      {project.description ||
                        "Sem descrição."}

                    </p>

                    <div className="home-project-progress">

                      <div className="home-progress-track">

                        <div
                          className="home-progress-fill"
                          style={{
                            width:
                              `${
                                project.progress ||
                                0
                              }%`,
                          }}
                        />

                      </div>

                      <span>
                        {project.progress ||
                          0}
                        %
                      </span>

                    </div>

                    <div className="home-project-footer">

                      <SquareCheckBig
                        size={16}
                      />

                      <span>
                        {project.tasks ||
                          0}
                        {" "}
                        tarefas
                      </span>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </AppLayout>
  );
}

export default Home;