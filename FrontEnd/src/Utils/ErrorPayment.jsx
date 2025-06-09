import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
const ErrorPayment = () => {
  return (
    <div class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Unsuccessful!
        </h1>
        <p className="text-gray-600 mb-6">Please Try Again</p>
        <Link
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
          to="/"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
export default ErrorPayment;
