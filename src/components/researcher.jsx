import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import { API_RESEARCHER_URL } from './constant'

class Researcher extends Component {

    state = {
        researcher: {},
        navigationDtl: {},
        researcherAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstResearcher();
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

    handleResearcherChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const researcher = { ...this.state.researcher };
        researcher[name] = name === 'researcherName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (researcher.researcherName === undefined || researcher.researcherName === null || researcher.researcherName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ researcher, saveButtonDisabled, undoButtonDisabled: false });
    }

    /* handleComboboxChange = (value, name) => {
        let researcher = { ...this.state.researcher };
        researcher[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (researcher.researcherName === undefined || researcher.researcherName === null || researcher.researcherName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ researcher, saveButtonDisabled });
    } */

    newResearcher = () => {
        const researcher = {};
        researcher.researcherStocks = [];
        this.setState({ researcher, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    saveResearcher = async () => {
        const { researcherName } = this.state.researcher;
        if (researcherName === undefined || researcherName === null || researcherName === '') {
            toast.error("Researcher name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.researcher);
            const options = {
                url: API_RESEARCHER_URL,
                method: 'POST',
                data: this.state.researcher
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { researcher, navigationDtl } = res.data;
                    this.setState({ researcher, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveResearcherShowMessage = async (message) => {
        try {
            await this.saveResearcher();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteResearcher = async () => {
        if (this.state.researcher.researcherId != null) {
            console.log("Delete: Researcher ID sent: ", this.state.researcher.researcherId);
            const options = {
                url: API_RESEARCHER_URL + this.state.researcher.researcherId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { researcher, navigationDtl } = res.data;
                    this.setState({ researcher, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            researcherAlert: false
        });
    }

    navigateResearcher = async (operation) => {
        const options = {
            url: API_RESEARCHER_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { researcher, navigationDtl } = res.data;
                this.setState({ researcher, navigationDtl })
                console.log(this.state.researcher);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateResearcher = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveResearcher();
            } catch (error) {
                console.log(error);
            }
            this.navigateResearcher(operation);
        } else {
            this.navigateResearcher(operation);
        }
    }

    firstResearcher = () => {
        this.saveAndNavigateResearcher('first');
    }

    previousResearcher = () => {
        this.saveAndNavigateResearcher('previous');
    }

    nextResearcher = () => {
        this.saveAndNavigateResearcher('next');
    }

    lastResearcher = () => {
        this.saveAndNavigateResearcher('last');
    }

    undoChanges = () => {
        const researcher = { ...this.state.researcher };
        console.log("Researcher ID: ", researcher.researcherId);
        this.setState({ saveButtonDisabled: true });
        if (researcher.researcherId != null) {
            const operation = researcher.researcherId;
            this.saveAndNavigateResearcher(operation);
        } else {
            this.firstResearcher();
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
        const { researcher, navigationDtl } = this.state;

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
                <Form dir="rtl">
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Researcher ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="researcherId"
                            placeholder="Researcher ID"
                            aria-label="Researcher ID"
                            readOnly
                            value={researcher.researcherId || ''}
                            onChange={this.handleResearcherChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Researcher Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="researcherName"
                            placeholder="Researcher Name"
                            aria-label="Researcher Name"
                            value={researcher.researcherName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleResearcherChange}
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
                            value={researcher.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleResearcherChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstResearcher}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousResearcher}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextResearcher}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastResearcher}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newResearcher}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ researcherAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
                            </Button>

                        <SweetAlert
                            show={this.state.researcherAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this researcher?"
                            onConfirm={() => this.deleteResearcher()}
                            onCancel={() => this.setState({ researcherAlert: false })}
                        >
                            Delete Researcher
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveResearcherShowMessage("Researcher saved successfully.")}
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.saveButtonDisabled}
                            active>Save
                            </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.undoButtonDisabled}
                            active>Undo
                            </Button>
                    </ButtonToolbar>

                </Form>
            </>
        );
    }
}

export default Researcher;