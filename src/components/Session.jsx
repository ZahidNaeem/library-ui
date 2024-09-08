import {useParams} from "react-router-dom";
import {getSession} from "../api";

const Session = ()=> {
  const {catId, sessionId} = useParams();
  const session = getSession({sessionId, catId});
  return (
      <div className="container">
        {session &&
            <>
              <h3>{session.name}</h3>
              <p>{session.desc}</p>
            </>
        }
      </div>
  );
}
export default Session;