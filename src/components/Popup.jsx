import Modal from 'react-bootstrap/Modal';

const Popup = ({member, handleClose}) => {
  return (
      <Modal show={true} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{member.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <hgroup style={{display: "flex"}}>
            <img style={{width: "200px"}} src={`images/${member.slug}_tn.svg`}
                 alt={member.name}/>
            <div>
              <h1>{member.name}</h1>
              <p>{member.bio}</p>
            </div>
          </hgroup>
        </Modal.Body>
      </Modal>
  );
}
export default Popup;