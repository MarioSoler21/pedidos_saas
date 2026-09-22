"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { ok: false, email: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="size-5" />
          Iniciar sesión
        </CardTitle>
        <CardDescription>Ingresá con tu correo y contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={state.email}
              placeholder="tu@correo.com"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
