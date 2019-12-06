import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import Select from 'react-select'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import { API_SUBJECT_URL } from './constant'
import { async } from 'q';

class Subject extends Component {

    state = {
        subject: {},
        navigationDtl: {},
        subjects: [],
        subjectAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstSubject();
        await this.populateSubjects();
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

    handleSubjectChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const subject = { ...this.state.subject };
        subject[name] = name === 'subjectName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (subject.subjectName === undefined || subject.subjectName === null || subject.subjectName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ subject, saveButtonDisabled, undoButtonDisabled: false });
    }

    /* handleComboboxChange = (value, name) => {
        let subject = { ...this.state.subject };
        subject[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (subject.subjectName === undefined || subject.subjectName === null || subject.subjectName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ subject, saveButtonDisabled });
    } */

    newSubject = () => {
        const subject = {};
        subject.subjectStocks = [];
        this.setState({ subject, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    saveSubject = async () => {
        const { subjectName } = this.state.subject;
        if (subjectName === undefined || subjectName === null || subjectName === '') {
            toast.error("Subject name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.subject);
            const options = {
                url: API_SUBJECT_URL + 'save',
                method: 'POST',
                data: this.state.subject
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { subject, navigationDtl } = res.data;
                    this.setState({ subject, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
    }

    saveSubjectShowMessage = async (message) => {
        try {
            await this.saveSubject();
        } catch (error) {
            console.log(error);
        }
        toast.success(message);
    }

    deleteSubject = async () => {
        if (this.state.subject.subjectId != null) {
            console.log("Delete: Subject ID sent: ", this.state.subject.subjectId);
            const options = {
                url: API_SUBJECT_URL + 'delete/' + this.state.subject.subjectId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { subject, navigationDtl } = res.data;
                    this.setState({ subject, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            subjectAlert: false
        });
    }

    navigateSubject = async (operation) => {
        const options = {
            url: API_SUBJECT_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { subject, navigationDtl } = res.data;
                this.setState({ subject, navigationDtl })
                console.log(this.state.subject);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateSubject = async (operation) => {
        const { saveButtonDisabled: saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveSubject();
            } catch (error) {
                console.log(error);
            }
            this.navigateSubject(operation);
        } else {
            this.navigateSubject(operation);
        }
    }

    firstSubject = () => {
        this.saveAndNavigateSubject('first');
    }

    previousSubject = () => {
        this.saveAndNavigateSubject('previous');
    }

    nextSubject = () => {
        this.saveAndNavigateSubject('next');
    }

    lastSubject = () => {
        this.saveAndNavigateSubject('last');
    }

    undoChanges = () => {
        const subject = { ...this.state.subject };
        console.log("Subject ID: ", subject.subjectId);
        this.setState({ saveButtonDisabled: true });
        if (subject.subjectId != null) {
            const operation = subject.subjectId;
            this.saveAndNavigateSubject(operation);
        } else {
            this.firstSubject();
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

    async populateSubjects() {
        console.log("Start populate subjects");
        const subjects = [];
        const options = {
            url: API_SUBJECT_URL + 'all',
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate subjects");
                res.data.forEach(element => {
                    subjects.push({
                        value: element.subjectId,
                        label: element.subjectName
                    });
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.setState({ subjects });
    }

    render() {
        const { subject, navigationDtl, subjects } = this.state;

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
                            <InputGroup.Text style={inputGroupTextStyle}>Subject ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectId"
                            placeholder="Subject ID"
                            aria-label="Subject ID"
                            readOnly
                            value={subject.subjectId || ''}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Subject Code</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectCode"
                            placeholder="Subject Code"
                            aria-label="Subject Code"
                            value={subject.subjectCode || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Subject Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectName"
                            placeholder="Subject Name"
                            aria-label="Subject Name"
                            value={subject.subjectName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Parent Subject</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={stretchStyle}>
                            <Select
                                name="parentSubjectId"
                                placeholder="Select Parent Subject"
                                aria-label="Select Parent Subject"
                                // value={{ value: subject.parentSubjectId || '', label: subjectName || '' }}
                                /* getOptionLabel={option => option.label}
                                getOptionValue={option => option.value} */
                                onChange={(name, value) => this.handleInvoiceSelectChange(name, value)}
                                clearable={true}
                                options={subjects}
                            />
                        </div>
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
                            value={subject.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstSubject}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousSubject}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextSubject}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastSubject}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newSubject}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ subjectAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
                            </Button>

                        <SweetAlert
                            show={this.state.subjectAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this subject?"
                            onConfirm={() => this.deleteSubject()}
                            onCancel={() => this.setState({ subjectAlert: false })}
                        >
                            Delete Subject
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveSubjectShowMessage("Subject saved successfully.")}
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

export default Subject;