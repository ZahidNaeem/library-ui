import Modal from "react-bootstrap/Modal";
import {Button} from "react-bootstrap";

const DeleteModal = ({handelDelete, handleClose}) => {
  return (
      <Modal show onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{color: "red", width: "100%"}}>Are you sure you want to delete this record?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handelDelete}>
            Yes
          </Button>
          <Button autoFocus variant="primary" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
  );
}
export default DeleteModal;