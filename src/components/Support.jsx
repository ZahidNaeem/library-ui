import {useState, useEffect} from "react";

const pageTitle = document.title;
const Support = ()=> {
  const [count, setCount] = useState(0);

  useEffect(()=> {
    document.title = `${pageTitle}--${count}`;
      }
  );

  return (
      <>
      <button onClick={()=> setCount(count + 1)}>
        {count < 1 ? 'Support Me' : `Supported ${count} times`}
      </button>
      </>
  );
}
export default Support;