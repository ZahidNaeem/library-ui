import logo from "../images/logo.png";
import {NavLink, useNavigate} from "react-router-dom";

const Header = ({logout})=> {

  const navigate = useNavigate();
  const getClass = ({isActive})=> (isActive ? "nav-active" : null);
  return (
      <header className="container">
        <img className="cursor-pointer" style={{width: "70px"}} src={logo} alt="Al-Abtaal" onClick={()=> navigate("/")}/>
        <nav>
          {/*<NavLink className={getClass} to="categories">Categories</NavLink>*/}
          {/*<NavLink className={getClass} to="registration">Registration</NavLink>*/}
          <NavLink className={getClass} to="subjects">Subjects</NavLink>
          <NavLink className={getClass} to="authors">Authors</NavLink>
          <NavLink className={getClass} to="publishers">Publishers</NavLink>
          <NavLink className={getClass} to="researchers">Researchers</NavLink>
          <NavLink className={getClass} to="shelves">Shelves</NavLink>
          <NavLink className={getClass} to="readers">Readers</NavLink>
          <NavLink className={getClass} to="books">Books</NavLink>
          <NavLink className={getClass} to="trans">Transaction</NavLink>
          <NavLink className={getClass} to="about">About</NavLink>
          <NavLink className={getClass} to="/" onClick={logout}>Logout</NavLink>
        </nav>
      </header>
  );
}
export default Header;