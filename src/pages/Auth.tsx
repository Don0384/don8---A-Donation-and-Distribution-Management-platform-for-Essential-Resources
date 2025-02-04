import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Users, ArrowLeft } from "lucide-react";

const Auth = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const isDonor = type === "donor";
  const title = isDonor ? "Donor" : "Receiver";
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </button>
      
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isDonor ? "bg-donor-primary/10" : "bg-receiver-primary/10"
          }`}>
            {isDonor ? (
              <Heart className="w-10 h-10 text-donor-primary" />
            ) : (
              <Users className="w-10 h-10 text-receiver-primary" />
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? `Login as ${title}` : `Sign up as ${title}`}
          </h2>
        </div>

        <div className="mt-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-opacity-0 focus:ring-offset-0"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-opacity-0 focus:ring-offset-0"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-opacity-0 focus:ring-offset-0"
                  placeholder="Enter your phone number"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
                isDonor
                  ? "bg-donor-primary hover:bg-donor-hover focus:ring-donor-primary"
                  : "bg-receiver-primary hover:bg-receiver-hover focus:ring-receiver-primary"
              }`}
            >
              {isLogin ? "Login" : "Sign up"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-medium ${
                isDonor ? "text-donor-primary" : "text-receiver-primary"
              } hover:underline`}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;