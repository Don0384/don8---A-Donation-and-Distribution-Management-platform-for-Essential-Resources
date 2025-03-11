
interface AuthToggleProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  isDonor: boolean;
  isAdmin: boolean;
}

const AuthToggle = ({ 
  isLogin, 
  setIsLogin, 
  isDonor, 
  isAdmin 
}: AuthToggleProps) => {
  return (
    <p className="mt-4 text-center text-sm text-gray-600">
      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
      <button
        onClick={() => setIsLogin(!isLogin)}
        className={`font-medium ${
          isAdmin
            ? "text-gray-800"
            : isDonor ? "text-donor-primary" : "text-receiver-primary"
        } hover:underline`}
      >
        {isLogin ? "Sign up" : "Login"}
      </button>
    </p>
  );
};

export default AuthToggle;
