import { MicrosoftLogin } from "@/components/devere-ui/microsoft-login";

function MicrosoftLoginDemo() {
  return (
    <MicrosoftLogin
      className="min-h-64 rounded-xl"
      description="Sign in with your Microsoft account to continue."
      onSignIn={() => {
        console.log("signIn");
      }}
      title="Welcome back"
    />
  );
}

export { MicrosoftLoginDemo };
