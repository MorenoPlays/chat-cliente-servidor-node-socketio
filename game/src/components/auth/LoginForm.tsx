import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import GamingLogo from "./GamingLogo";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Preencha todos os campos!");
      return;
    }

    const result = login(username, password);

    if (result.success) {
      console.log("Login realizado:", result.user);
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 lg:py-12">
      {/* Logo */}
      <div className="flex justify-center ">
        <GamingLogo />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          Entrar
        </h1>
        <p className="text-white/70">Aventura te espera!</p>
        {error && (
          <div className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>

      {/* Social buttons */}
      <div className="flex gap-4 mb-6">
        <Button variant="social" className="flex-1 text-white border-white/10">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button variant="social" className="flex-1 text-white border-white/10">
          Intra
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0b0f22] px-4 text-white/70">
            ou continue com username e senha
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <Input
            type="text"
            placeholder="Username_AXOLO"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="pl-12 pr-12 h-12 bg-[#0b0f22] border border-white/10 text-white"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-12 pr-12 h-12 bg-[#0b0f22] border border-white/10 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute  right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          variant="gaming"
          className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-emerald-500  text-white/90 font-semibold"
        >
          Entrar
        </Button>
      </form>

      {/* Toggle login/signup */}
      <p className="text-center mt-4 text-white/70">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors ml-1"
        >
          Cadastrar-se
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
