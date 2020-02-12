import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, getCurrentUser } from './util/APIUtils'
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
    BUTTON_UNDO,
    BUTTON_SEARCH,
    BUTTON_EXECUTE
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
        undoButtonDisabled: true,
        isSearching: false
    }

    async componentDidMount() {
        await this.firstAuthor();
        const canAdd = await this.canAdd();
        const canEdit = await this.canEdit();
        const canDelete = await this.canDelete();
        this.setState({ addButtonDisabled: !canAdd, fieldsDisabled: !canEdit, deleteButtonDisabled: !canDelete });
    }

    getCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            console.log("Current User: ", res.data.entity);
            return res.data.entity;
        } catch (error) {
            console.log(error);
        }
    }

    handleAuthorChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const author = { ...this.state.author };
        author[name] = name === 'authorName' ? value.toUpperCase() : value;
        this.setState({ author });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { author } = this.state;
        return !(author.authorName === undefined || author.authorName === null || author.authorName === '');
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    disableAddButton = (boolean) => {
        this.setState({ addButtonDisabled: boolean });
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

    addAuthor = () => {
        const author = {};
        this.setState({ author, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    saveAuthor = async () => {
        let saveResponse = {};
        if (this.validateForm() === false) {
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
                console.log("Post: Object received: ", res.data.entity);
                const { author, navigationDtl } = res.data.entity;
                this.setState({ author, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                this.disableAddButton(false);
                saveResponse = res.data;
            } catch (error) {
                saveResponse = error.response.data;
            }
        }
        return saveResponse;
    }

    saveAuthorShowMessage = async () => {
        try {
            const saveResponse = await this.saveAuthor();
            if (saveResponse.success === undefined || saveResponse.success === null) {
                toast.error(saveResponse);
            } else {
                toast.success(saveResponse.message);
            }
        } catch (error) {
            toast.error(error.response.data.message || 'Sorry! Something went wrong. Please try again or contact administrator.');
            return;
        }
    }

    deleteAuthor = async () => {
        const author = { ...this.state.author };
        if (author.authorId !== undefined && author.authorId !== null) {
            console.log("Delete: Author ID sent: ", author.authorId);
            const options = {
                url: API_AUTHOR_URL + author.authorId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                console.log("Delete: Response: ", res);
                const { author, navigationDtl } = res.data.entity;
                this.setState({ author, navigationDtl, saveButtonDisabled: true });
                this.disableAddButton(false);
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || 'Sorry! Something went wrong. Please try again or contact administrator.');
                return;

            }
        } else {
            this.undoChanges();
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
            const { author, navigationDtl } = res.data.entity;
            this.setState({ author, navigationDtl })
            console.log(this.state.author);
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

    searchAuthor = () => {
        const isSearching = !this.state.isSearching;
        this.setState({ isSearching });
    }

    firstAuthor = async () => {
        await this.saveAndNavigateAuthor('first');
    }

    previousAuthor = async () => {
        await this.saveAndNavigateAuthor('previous');
    }

    nextAuthor = async () => {
        await this.saveAndNavigateAuthor('next');
    }

    lastAuthor = async () => {
        await this.saveAndNavigateAuthor('last');
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
        this.disableAddButton(false);
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
        const {
            author,
            navigationDtl,
            fieldsDisabled,
            addButtonDisabled,
            deleteButtonDisabled,
            saveButtonDisabled,
            undoButtonDisabled,
            isSearching
        } = this.state;

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
                            disabled={fieldsDisabled}
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
                            disabled={fieldsDisabled}
                            onChange={this.handleAuthorChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ authorAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
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
                            onClick={this.saveAuthorShowMessage}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            disabled={saveButtonDisabled}
                            active>{BUTTON_SAVE}
                        </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            disabled={undoButtonDisabled}
                            active>{BUTTON_UNDO}
                        </Button>
                    </ButtonToolbar>
                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            // disabled={addButtonDisabled}
                            onClick={this.searchAuthor}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{isSearching === false ? BUTTON_SEARCH : BUTTON_EXECUTE}
                        </Button>
                    </ButtonToolbar>
                </Form>
            </>
        );
    }
}

export default Author;