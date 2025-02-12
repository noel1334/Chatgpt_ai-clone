import { SignIn } from "@clerk/clerk-react";
import "./login.css";

const Login = () => {
  return (
    <div className="login">
      <SignIn
        path="/login"
        signUpUrl="/register"
        forceRedirectUrl={"/dashboard"}
      />
    </div>
  );
};

export default Login;
