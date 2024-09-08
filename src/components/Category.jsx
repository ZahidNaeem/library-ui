import {NavLink, Outlet, useParams} from "react-router-dom";
import {getCategory} from "../api";

const Category = ()=> {
  const {catId} = useParams();
  const category = getCategory(catId);
  return (
      <div className="container">
        <h2>{category.name} Sessions</h2>
        <ul className="session-list">
          {category.sessions.map(session => (
              <li className="session" key={session.id}>
                <NavLink className={({isActive})=> isActive ? "session-active" : null} to={session.id}>
                  <p>{session.name}</p>
                  <p>{session.speaker.name} | {session.speaker.org}</p>
                </NavLink>
              </li>
          ))}
        </ul>
        <Outlet />
      </div>
  );
}
export default Category;