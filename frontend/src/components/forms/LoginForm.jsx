import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthContext } from "@/Context/AuthContextDefinition";
import redirectForRole from "@/Hooks/redirecter";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useContext(AuthContext) || {};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (typeof login !== "function") {
        throw new Error("Authentication is not initialized");
      }
      const result = await login({ username: email, password });
      if (!result?.success) {
        throw new Error(result?.error || result?.message || "Login failed");
      }
      const role = result?.user?.role?.role_name || result?.user?.role;
      const redirection = redirectForRole({ role });
      navigate(redirection);
    } catch (err) {
      setError("Login échoué : " + (err.message || "Erreur inconnue"));
      console.error("Échec de la connexion :", err);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="border-none">
        <CardHeader className="items-center">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Votre espace document intelligente</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="username"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Connexion..." : "Login"}
                </Button>
                
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
