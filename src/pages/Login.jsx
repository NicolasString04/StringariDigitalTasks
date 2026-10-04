import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Target,
  Zap,
  BarChart3,
  ArrowLeft,
  User,
} from "lucide-react";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../firebase/firebase";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState("login");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
   * =========================
   * FEEDBACK
   * =========================
   */

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  /*
   * =========================
   * ERROS FIREBASE
   * =========================
   */

  function getFirebaseError(error) {
    switch (error.code) {
      case "auth/invalid-credential":
        return "E-mail ou senha incorretos.";

      case "auth/user-not-found":
        return "Usuário não encontrado.";

      case "auth/wrong-password":
        return "Senha incorreta.";

      case "auth/email-already-in-use":
        return "Este e-mail já está cadastrado.";

      case "auth/weak-password":
        return "A senha deve possuir pelo menos 6 caracteres.";

      case "auth/invalid-email":
        return "Informe um e-mail válido.";

      case "auth/popup-closed-by-user":
        return "Login com Google cancelado.";

      case "auth/popup-blocked":
        return "O navegador bloqueou a janela do Google.";

      case "auth/unauthorized-domain":
        return "Este domínio não está autorizado no Firebase.";

      case "auth/operation-not-allowed":
        return "Esse método de login ainda não está habilitado no Firebase.";

      case "auth/network-request-failed":
        return "Não foi possível conectar ao Firebase.";

      case "auth/too-many-requests":
        return "Muitas tentativas. Aguarde um pouco e tente novamente.";

      default:
        return "Não foi possível concluir a operação.";
    }
  }

  /*
   * =========================
   * PERSISTÊNCIA
   * =========================
   */

  async function configurePersistence() {
    await setPersistence(
      auth,
      rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence
    );
  }

  /*
   * =========================
   * LOGIN GOOGLE
   * =========================
   */

  async function handleGoogleLogin() {
    resetFeedback();

    try {
      setLoading(true);

      await configurePersistence();

      await signInWithPopup(
        auth,
        googleProvider
      );

      navigate("/home");
    } catch (error) {
      console.error(
        "Erro no login Google:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * LOGIN EMAIL / SENHA
   * =========================
   */

  async function handleLogin(event) {
    event.preventDefault();

    resetFeedback();

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Informe seu e-mail e sua senha."
      );

      return;
    }

    try {
      setLoading(true);

      await configurePersistence();

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/home");
    } catch (error) {
      console.error(
        "Erro no login:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * CRIAR CONTA
   * =========================
   */

  async function handleRegister(event) {
    event.preventDefault();

    resetFeedback();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        "Preencha todos os campos."
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }

    try {
      setLoading(true);

      await configurePersistence();

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(
        result.user,
        {
          displayName:
            name.trim(),
        }
      );

      navigate("/home");
    } catch (error) {
      console.error(
        "Erro ao criar conta:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * RECUPERAR SENHA
   * =========================
   */

  async function handleForgotPassword(
    event
  ) {
    event.preventDefault();

    resetFeedback();

    if (!email.trim()) {
      setError(
        "Informe seu e-mail."
      );

      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setMessage(
        "Enviamos um link de recuperação para o seu e-mail."
      );
    } catch (error) {
      console.error(
        "Erro ao recuperar senha:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">

      {/* =========================
          LADO ESQUERDO
      ========================= */}

      <section className="login-visual">

        <div className="login-visual-overlay" />

        <div className="login-left-content">

          {/* LOGO */}

          <div className="login-brand">

            <img
              src="/images/logo.png"
              alt="Stringari Digital"
              className="login-logo"
            />

          </div>

          {/* TEXTO */}

          <div className="login-presentation">

            <h1>
              Organize suas ideias.
              <br />
              Construa resultados.
            </h1>

            <p className="login-description">
              Um espaço simples e poderoso
              para gerenciar seus projetos
              e tarefas.
            </p>

            {/* BENEFÍCIOS */}

            <div className="login-benefits">

              <div className="login-benefit">

                <div className="benefit-icon">
                  <Target size={21} />
                </div>

                <div>
                  <strong>
                    Mais foco
                  </strong>

                  <span>
                    Tudo em um só lugar.
                  </span>
                </div>

              </div>

              <div className="login-benefit">

                <div className="benefit-icon">
                  <Zap size={21} />
                </div>

                <div>
                  <strong>
                    Mais produtividade
                  </strong>

                  <span>
                    Transforme planos em ações.
                  </span>
                </div>

              </div>

              <div className="login-benefit">

                <div className="benefit-icon">
                  <BarChart3 size={21} />
                </div>

                <div>
                  <strong>
                    Mais resultados
                  </strong>

                  <span>
                    Construa um futuro extraordinário.
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* FRASE INFERIOR */}

          <span className="login-left-quote">
            Construa hoje um futuro extraordinário.
          </span>

        </div>

      </section>

      {/* =========================
          LADO DIREITO
      ========================= */}

      <section className="login-form-side">

        <div className="login-right-glow login-right-glow-top" />

        <div className="login-right-glow login-right-glow-bottom" />

        <div className="login-card">

          {/* =====================
              LOGIN
          ====================== */}

          {mode === "login" && (
            <>

              <div className="login-card-header">

                <h2>
                  Bem-vindo de volta
                </h2>

                <p>
                  Entre na sua conta
                  para continuar.
                </p>

              </div>

              {/* GOOGLE */}

              <button
                type="button"
                className="google-login-button"
                onClick={
                  handleGoogleLogin
                }
                disabled={
                  loading
                }
              >

                <span className="google-icon">
                  G
                </span>

                Continuar com o Google

              </button>

              {/* DIVISOR */}

              <div className="login-divider">

                <span />

                <p>
                  ou
                </p>

                <span />

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleLogin
                }
              >

                {/* EMAIL */}

                <div className="login-field">

                  <label
                    htmlFor="login-email"
                  >
                    E-mail
                  </label>

                  <div className="login-input-wrapper">

                    <Mail
                      size={17}
                    />

                    <input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event
                            .target
                            .value
                        )
                      }
                      autoComplete="email"
                    />

                  </div>

                </div>

                {/* SENHA */}

                <div className="login-field">

                  <label
                    htmlFor="login-password"
                  >
                    Senha
                  </label>

                  <div className="login-input-wrapper">

                    <Lock
                      size={17}
                    />

                    <input
                      id="login-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Sua senha"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event
                            .target
                            .value
                        )
                      }
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-label="Mostrar ou esconder senha"
                    >

                      {showPassword ? (

                        <EyeOff
                          size={17}
                        />

                      ) : (

                        <Eye
                          size={17}
                        />

                      )}

                    </button>

                  </div>

                </div>

                {/* OPÇÕES */}

                <div className="login-options">

                  <label className="remember-option">

                    <input
                      type="checkbox"
                      checked={
                        rememberMe
                      }
                      onChange={(
                        event
                      ) =>
                        setRememberMe(
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    <span>
                      Lembrar de mim
                    </span>

                  </label>

                  <button
                    type="button"
                    className="login-link-button"
                    onClick={() => {
                      resetFeedback();

                      setMode(
                        "forgot"
                      );
                    }}
                  >

                    Esqueci minha senha

                  </button>

                </div>

                {/* ERRO */}

                {error && (

                  <div className="login-feedback login-error">

                    {error}

                  </div>

                )}

                {/* ENTRAR */}

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={
                    loading
                  }
                >

                  {loading
                    ? "Entrando..."
                    : "Entrar"}

                </button>

              </form>

              {/* CRIAR CONTA */}

              <p className="login-create-account">

                Ainda não tem uma conta?

                <button
                  type="button"
                  onClick={() => {
                    resetFeedback();

                    setMode(
                      "register"
                    );
                  }}
                >
                  Criar conta
                </button>

              </p>

            </>
          )}

          {/* =====================
              CADASTRO
          ====================== */}

          {mode === "register" && (
            <>

              <button
                type="button"
                className="login-back-button"
                onClick={() => {
                  resetFeedback();

                  setMode(
                    "login"
                  );
                }}
              >

                <ArrowLeft
                  size={17}
                />

                Voltar

              </button>

              <div className="login-card-header">

                <h2>
                  Criar sua conta
                </h2>

                <p>
                  É rápido e grátis.
                </p>

              </div>

              <button
                type="button"
                className="google-login-button"
                onClick={
                  handleGoogleLogin
                }
                disabled={
                  loading
                }
              >

                <span className="google-icon">
                  G
                </span>

                Continuar com o Google

              </button>

              <div className="login-divider">

                <span />

                <p>
                  ou
                </p>

                <span />

              </div>

              <form
                onSubmit={
                  handleRegister
                }
              >

                {/* NOME */}

                <div className="login-field">

                  <label
                    htmlFor="register-name"
                  >
                    Nome
                  </label>

                  <div className="login-input-wrapper">

                    <User
                      size={17}
                    />

                    <input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={
                        name
                      }
                      onChange={(
                        event
                      ) =>
                        setName(
                          event
                            .target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="login-field">

                  <label
                    htmlFor="register-email"
                  >
                    E-mail
                  </label>

                  <div className="login-input-wrapper">

                    <Mail
                      size={17}
                    />

                    <input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event
                            .target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

                {/* SENHA */}

                <div className="login-field">

                  <label
                    htmlFor="register-password"
                  >
                    Senha
                  </label>

                  <div className="login-input-wrapper">

                    <Lock
                      size={17}
                    />

                    <input
                      id="register-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Mínimo 6 caracteres"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event
                            .target
                            .value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                    >

                      {showPassword ? (

                        <EyeOff
                          size={17}
                        />

                      ) : (

                        <Eye
                          size={17}
                        />

                      )}

                    </button>

                  </div>

                </div>

                {error && (

                  <div className="login-feedback login-error">

                    {error}

                  </div>

                )}

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={
                    loading
                  }
                >

                  {loading
                    ? "Criando..."
                    : "Criar conta"}

                </button>

              </form>

              <p className="login-create-account">

                Já possui uma conta?

                <button
                  type="button"
                  onClick={() => {
                    resetFeedback();

                    setMode(
                      "login"
                    );
                  }}
                >
                  Entrar
                </button>

              </p>

            </>
          )}

          {/* =====================
              RECUPERAR SENHA
          ====================== */}

          {mode === "forgot" && (
            <>

              <button
                type="button"
                className="login-back-button"
                onClick={() => {
                  resetFeedback();

                  setMode(
                    "login"
                  );
                }}
              >

                <ArrowLeft
                  size={17}
                />

                Voltar

              </button>

              <div className="login-card-header">

                <h2>
                  Recuperar senha
                </h2>

                <p>
                  Informe seu e-mail
                  para receber o link
                  de recuperação.
                </p>

              </div>

              <form
                onSubmit={
                  handleForgotPassword
                }
              >

                <div className="login-field">

                  <label
                    htmlFor="forgot-email"
                  >
                    E-mail
                  </label>

                  <div className="login-input-wrapper">

                    <Mail
                      size={17}
                    />

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event
                            .target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

                {error && (

                  <div className="login-feedback login-error">

                    {error}

                  </div>

                )}

                {message && (

                  <div className="login-feedback login-success">

                    {message}

                  </div>

                )}

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={
                    loading
                  }
                >

                  {loading
                    ? "Enviando..."
                    : "Enviar link"}

                </button>

              </form>

            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default Login;