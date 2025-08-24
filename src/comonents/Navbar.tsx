    import {  useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div><nav className="flex justify-between items-center px-8 py-4 bg-indigo-500 backdrop-blur-md">
        <div className="text-white font-bold text-xl">CloudEase</div>
        <ul className="flex space-x-6 text-white font-medium">
          <li className="hover:underline cursor-pointer" onClick={() => navigate("/")}>Home</li>
          <li className="hover:underline cursor-pointer" onClick={() => navigate("/chat")}>Chat</li>
          <li className="hover:underline cursor-pointer" onClick={() => navigate("/file-manager")}>File Manager</li>
          <li className="hover:underline cursor-pointer" onClick={() => navigate("/terminal")}>Terminal</li>
        </ul>
      </nav></div>
  )
}

export default Navbar