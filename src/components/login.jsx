import {Button, Form} from "react-bootstrap";
import {useState} from "react";
import {NavLink} from "react-router-dom";

const Login = ({loginRequest}) => {
  const [loginData, setLoginData] = useState({});

  function onChange(e) {
    let {name, value} = e.target;
    const request = {...loginData};
    request[name] = value;
    setLoginData(request);
  }

  function onSubmit() {
    loginRequest(loginData);
  }

  return (
      <Form>
        <Form.Group style={{display: "flex"}} className="mb-3">
          <Form.Label className="label-default-size">Username/Email</Form.Label>
          <Form.Control type="input" name="usernameOrEmail" value={loginData.usernameOrEmail || ''} onChange={onChange}/>
        </Form.Group>
        <Form.Group style={{display: "flex"}} className="mb-3">
          <Form.Label className="label-default-size">Password</Form.Label>
          <Form.Control type="password" name="password" value={loginData.password || ''} onChange={onChange}/>
        </Form.Group>
        <Button style={{width: "100%"}} onClick={onSubmit}>Login</Button>
        <Form.Group style={{textAlign: "center"}} className="mb-3">
          <Form.Label className="label-default-size">Not a registered user?</Form.Label>&nbsp;
          <NavLink to="signup">Signup</NavLink>
        </Form.Group>
      </Form>
  );
}
export default Login;