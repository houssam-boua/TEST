import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Accès non autorisé
          </CardTitle>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Veuillez contacter votre administrateur si vous pensez qu'il s'agit
            d'une erreur.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/login">Retour à la connexion</Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Page précédente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
