import {Form} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useRef} from "react";

const Registration = ()=> {
  const emailRef = useRef(null);
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    navigate("/confirmed", {state: {email: emailRef.current.value}});
  }

  return (
      <Form style={{display: "grid"}} onSubmit={submit}>
        <label>
          Email:
          <input type="email" name="email" ref={emailRef}/>
        </label>
        <input type="submit" name="submit"/>
      </Form>
  );
}
export default Registration;