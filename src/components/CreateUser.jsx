import {Form} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import {addUser} from "../api/UserService";

const CreateUser = () => {
  const navigate = useNavigate();
  const [signupRequest, setSignupRequest] = useState({});

  function onChange(e) {
    let {name, value} = e.target;
    const request = {...signupRequest};
    request[name] = value;
    setSignupRequest(request);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const response = await addUser(signupRequest);
      const data = response.data;
      const userSummary = data.entity;
      toast.success(data.message);
      navigate("/confirmed", {
        state: {
          id: userSummary.id,
          name: userSummary.name,
          email: userSummary.email
        }
      });
    } catch (e) {
      toast.error(e.response.data.message);
    }
  }

  return (
      <Form style={{display: "grid"}} onSubmit={submit}>
        <label>
          Name:
          <input type="text" name="name" value={signupRequest.name || ''} onChange={onChange}/>
        </label>
        <label>
          Username:
          <input type="text" name="username" value={signupRequest.username || ''} onChange={onChange}/>
        </label>
        <label>
          Email:
          <input type="email" name="email" value={signupRequest.email || ''} onChange={onChange}/>
        </label>
        <label>
          Password:
          <input type="password" name="password" value={signupRequest.password || ''} onChange={onChange}/>
        </label>
        <input type="submit" name="submit"/>
        <ToastContainer autoClose={2000}/>
      </Form>
  );
}
export default CreateUser;