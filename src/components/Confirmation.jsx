import {NavLink, useLocation} from "react-router-dom";
import {BASE_URL, USERS_URL} from "../common/Constants";
import {activateUser} from "../api/UserService";
import {toast} from "react-toastify";

const Confirmation = () => {

  async function activate(id) {
    try {
      const response = await activateUser(id);
      const data = response.data;
      const userSummary = data.entity;
      toast.success(data.message);
    } catch (e) {
      toast.error(e.response.data.message);
    }
  }

  const {state} = useLocation();
  if (state) {
    return (
        <div className="container">
          <h1>Thanks!</h1>
          <p><strong>{state.name}</strong> You are now registered</p>
          <p>For activation, please click on link below</p>
          <NavLink to="/login" onClick={() => activate(state.id)}>{`${BASE_URL}/${USERS_URL}/${state.id}`}</NavLink>
        </div>
    );
  } else {
    return (
        <div className="container">
          <h1>Error</h1>
          <p>There is an issue in registration</p>
        </div>
    );
  }
}
export default Confirmation;