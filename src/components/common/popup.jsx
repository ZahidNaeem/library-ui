import React, { Component } from 'react';
import Modal from '../popup/model'
import { Button } from 'react-bootstrap';

class Popup extends Component {
    state = {
        show: false
    }

    componentWillReceiveProps() {
        const { show } = this.props;
        if (this.state.show !== show) {
            this.setState({ show });
        }
    }

    hidePopup = () => {
        console.log("onClose called");
        this.setState({ show: false });
    }

    showCloseButton = (show) => {
        const {
            closeButtonTitle
        } = this.props;
        if (show === true) {
            return <Button
                btnStyle="default"
                onClick={this.hidePopup}
            >
                {closeButtonTitle}
            </Button>;
        } else {
            return '';
        }
    }

    showPopup = () => {
        const {
            modalHeader,
            modalBody,
            modalFooter,
            showCloseButton
        } = this.props;
        if (this.state.show === true) {
            return <Modal onClose={this.hidePopup}>
                {modalHeader()}
                <Modal.Body padding>
                    {modalBody()}
                </Modal.Body>
                <Modal.Footer>
                    {modalFooter !== undefined ? modalFooter() : ''}
                    {this.showCloseButton(showCloseButton)}
    </Modal.Footer>
            </Modal>;
        } else {
            return '';
        }
    }

    render() {

        return (
            <div>
                {this.showPopup()}
            </div>
        );
    }
}

export default Popup;