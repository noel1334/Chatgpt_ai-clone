import { SignUp } from "@clerk/clerk-react";
import "./register.css";

const Register = () => {
  return (
    <div className="register">
      <SignUp path="/register" signInUrl="/login" />
    </div>
  );
};

export default Register;
