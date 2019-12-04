import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import { API_AUTHOR_URL } from './constant'
import { async } from 'q';

class Author extends Component {

    state = {
        author: {},
        navigationDtl: {},
        authorAlert: false,
        saveDisabled: true,
        fieldsDisabled: true,
        fieldsChanged: false
    }

    async componentDidMount() {
        this.firstAuthor();
        await this.buttonAdd();
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
        let saveDisabled = { ...this.state.saveDisabled };
        if (author.authorName === undefined || author.authorName === null || author.authorName === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ author, saveDisabled, fieldsChanged: true });
    }

    /* handleComboboxChange = (value, name) => {
        let author = { ...this.state.author };
        author[name] = value.toUpperCase();
        let saveDisabled = { ...this.state.saveDisabled };
        if (author.authorName === undefined || author.authorName === null || author.authorName === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ author, saveDisabled });
    } */

    newAuthor = () => {
        const author = {};
        author.authorStocks = [];
        this.setState({ author, navigationDtl: { first: true, last: true } });
    }

    saveAuthor = async () => {
        const { authorName } = this.state.author;
        if (authorName === undefined || authorName === null || authorName === '') {
            toast.error("Author name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.author);
            const options = {
                url: API_AUTHOR_URL + 'save',
                method: 'POST',
                data: this.state.author
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { author, navigationDtl } = res.data;
                    this.setState({ author, navigationDtl, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
    }

    saveAuthorShowMessage = async (message) => {
        try {
            await this.saveAuthor();
        } catch (error) {
            console.log(error);
        }
        toast.success(message);
    }

    deleteAuthor = async () => {
        if (this.state.author.authorId != null) {
            console.log("Delete: Author ID sent: ", this.state.author.authorId);
            const options = {
                url: API_AUTHOR_URL + 'delete/' + this.state.author.authorId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { author, navigationDtl } = res.data;
                    this.setState({ author, navigationDtl, saveDisabled: true });
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
        const { saveDisabled } = this.state;
        if (!saveDisabled) {
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
        this.setState({ saveDisabled: true });
        if (author.authorId != null) {
            const operation = author.authorId;
            this.saveAndNavigateAuthor(operation);
        } else {
            this.firstAuthor();
        }
        this.setState({ fieldsChanged: false });
    }

    userRoles = async () => {
        const currentUser = await this.getCurrentUser();
        return currentUser.roles;
    }

    buttonAdd = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role == 'ROLE_PM');

    }

    render() {
        const { author, navigationDtl } = this.state;

        const inputGroupTextStyle = {
            width: "180px"
        }

        const stretchStyle = {
            flex: "1"
        }

        const smallButtonStyle = {
            width: "10%"
        }

        return (
            <>
                <Form>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Author ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="authorId"
                            placeholder="Author ID"
                            aria-label="Author ID"
                            readOnly
                            value={author.authorId || ''}
                            onChange={this.handleAuthorChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Author Name</InputGroup.Text>
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
                            <InputGroup.Text style={inputGroupTextStyle}>Remarks</InputGroup.Text>
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

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={this.newAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={this.newAuthor}
                            className="mr-1" style={smallButtonStyle}
                            active>Edit
                            </Button>

                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={() => this.setState({ authorAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
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
                    </ButtonToolbar>

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            onClick={() => this.saveAuthorShowMessage("Author saved successfully.")}
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.saveDisabled}
                            active>Save
                            </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="mr-1" style={smallButtonStyle}
                            disabled={!this.state.fieldsChanged}
                            active>Undo
                            </Button>
                    </ButtonToolbar>
                </Form>
            </>
        );
    }
}

export default Author;