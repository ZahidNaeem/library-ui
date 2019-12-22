import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_AUTHOR_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    SMALL_BUTTON_STYLE,
    BUTTON_FIRST,
    BUTTON_PREVIOUS,
    BUTTON_NEXT,
    BUTTON_LAST,
    BUTTON_ADD,
    BUTTON_DELETE,
    BUTTON_SAVE,
    BUTTON_UNDO
} from './constant'

class Author extends Component {

    state = {
        author: {},
        navigationDtl: {},
        authorAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstAuthor();
        const canAdd = await this.canAdd();
        const canEdit = await this.canEdit();
        const canDelete = await this.canDelete();
        this.setState({ addButtonDisabled: !canAdd, fieldsDisabled: !canEdit, deleteButtonDisabled: !canDelete });
    }

    getCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            if (isSuccessfullResponse(res)) {
                console.log("Current User: ", res.data);
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleAuthorChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const author = { ...this.state.author };
        author[name] = name === 'authorName' ? value.toUpperCase() : value;
        this.enableSaveUndoButton(author);
        this.setState({ author });
    }

    enableSaveUndoButton = (author) => {
        let saveButtonDisabled = true;
        if (author.authorName === undefined || author.authorName === null || author.authorName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    /* handleComboboxChange = (value, name) => {
        let author = { ...this.state.author };
        author[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (author.authorName === undefined || author.authorName === null || author.authorName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ author, saveButtonDisabled });
    } */

    newAuthor = () => {
        const author = {};
        author.authorStocks = [];
        this.setState({ author, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    saveAuthor = async () => {
        const { authorName } = this.state.author;
        if (authorName === undefined || authorName === null || authorName === '') {
            toast.error("Author name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.author);
            const options = {
                url: API_AUTHOR_URL,
                method: 'POST',
                data: this.state.author
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { author, navigationDtl } = res.data;
                    this.setState({ author, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveAuthorShowMessage = async (message) => {
        try {
            await this.saveAuthor();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteAuthor = async () => {
        if (this.state.author.authorId != null) {
            console.log("Delete: Author ID sent: ", this.state.author.authorId);
            const options = {
                url: API_AUTHOR_URL + this.state.author.authorId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { author, navigationDtl } = res.data;
                    this.setState({ author, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            authorAlert: false
        });
    }

    navigateAuthor = async (operation) => {
        const options = {
            url: API_AUTHOR_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { author, navigationDtl } = res.data;
                this.setState({ author, navigationDtl })
                console.log(this.state.author);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateAuthor = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveAuthor();
            } catch (error) {
                console.log(error);
            }
            this.navigateAuthor(operation);
        } else {
            this.navigateAuthor(operation);
        }
    }

    firstAuthor = () => {
        this.saveAndNavigateAuthor('first');
    }

    previousAuthor = () => {
        this.saveAndNavigateAuthor('previous');
    }

    nextAuthor = () => {
        this.saveAndNavigateAuthor('next');
    }

    lastAuthor = () => {
        this.saveAndNavigateAuthor('last');
    }

    undoChanges = () => {
        const author = { ...this.state.author };
        console.log("Author ID: ", author.authorId);
        this.setState({ saveButtonDisabled: true });
        if (author.authorId != null) {
            const operation = author.authorId;
            this.navigateAuthor(operation);
        } else {
            this.firstAuthor();
        }
        this.setState({ undoButtonDisabled: true });
    }

    userRoles = async () => {
        const currentUser = await this.getCurrentUser();
        return currentUser.roles;
    }

    canAdd = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_PM');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    canEdit = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_ADMIN');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    canDelete = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_ADMIN');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }


    render() {
        const { author, navigationDtl } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Author ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="authorId"
                            placeholder="Author ID"
                            aria-label="Author ID"
                            readOnly
                            value={author.authorId || ''}
                            onChange={this.handleAuthorChange}
                        />
                    </InputGroup> */}

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Author Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="authorName"
                            placeholder="Author Name"
                            aria-label="Author Name"
                            value={author.authorName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleAuthorChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Remarks</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="textarea"
                            rows="3"
                            name="remarks"
                            placeholder="Remarks"
                            aria-label="Remarks"
                            value={author.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleAuthorChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstAuthor}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousAuthor}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextAuthor}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastAuthor}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newAuthor}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ authorAlert: true })}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
                        </Button>

                        <SweetAlert
                            show={this.state.authorAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this author?"
                            onConfirm={() => this.deleteAuthor()}
                            onCancel={() => this.setState({ authorAlert: false })}
                        >
                            Delete Author
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveAuthorShowMessage("Author saved successfully.")}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            disabled={this.state.saveButtonDisabled}
                            active>{BUTTON_SAVE}
                        </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            disabled={this.state.undoButtonDisabled}
                            active>{BUTTON_UNDO}
                        </Button>
                    </ButtonToolbar>

                </Form>
            </>
        );
    }
}

export default Author;