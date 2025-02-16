// components/GoogleSignInButton.tsx
import { Button } from "@/components/shadcn-ui/button";
import { signIn } from "next-auth/react";
import { Icons } from "@/components/icons";

export default function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      type="button"
      className="w-full bg-background"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <Icons.google className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  );
}
