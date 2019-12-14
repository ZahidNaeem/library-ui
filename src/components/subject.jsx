import React, { Component } from 'react';
import {
    Button,
    ButtonToolbar,
    Form,
    FormControl,
    InputGroup
} from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import Select from 'react-select'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { getCurrentUser, isSuccessfullResponse, request } from './util/APIUtils'
import { API_SUBJECT_URL } from './constant'

let toBeExcluded = [];
class Subject extends Component {

    state = {
        subject: {},
        subjects: [],
        subjectName: '',
        subjectsExcludeCurrent: [],
        navigationDtl: {},
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
        this.setState({
            addButtonDisabled: !canAdd,
            fieldsDisabled: !canEdit,
            deleteButtonDisabled: !canDelete
        });
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
        console.log("Target value", value);
        const subject = { ...this.state.subject };
        subject[name] = name === 'subjectName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (subject.subjectName === undefined || subject.subjectName === null
            || subject.subjectName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ subject, saveButtonDisabled, undoButtonDisabled: false });
    }

    handleSubjectSelectChange = (selectedSubject, name) => {
        const subject = { ...this.state.subject };
        console.log("Target name", name.name);
        console.log("Target value", selectedSubject.value);
        subject[name.name] = selectedSubject.value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (subject.subjectName === undefined || subject.subjectName === null
            || subject.subjectName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ subject, saveButtonDisabled, undoButtonDisabled: false });
        this.populateSubjectName(subject.parentSubjectId);
    };

    newSubject = () => {
        const subject = {};
        this.setState({
            subject,
            navigationDtl: { first: true, last: true },
            undoButtonDisabled: false
        });
        this.populateSubjectName(subject.parentSubjectId);
    }

    saveSubject = async () => {
        const { subjectName } = this.state.subject;
        if (subjectName === undefined || subjectName === null || subjectName
            === '') {
            toast.error("Subject name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.subject);
            const options = {
                url: API_SUBJECT_URL,
                method: 'POST',
                data: this.state.subject
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { subject, navigationDtl } = res.data;
                    this.setState({
                        subject,
                        navigationDtl,
                        saveButtonDisabled: true,
                        undoButtonDisabled: true
                    });
                    await this.populateSubjects();
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveSubjectShowMessage = async (message) => {
        try {
            await this.saveSubject();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteSubject = async () => {
        if (this.state.subject.subjectId != null) {
            console.log("Delete: Subject ID sent: ", this.state.subject.subjectId);
            const options = {
                url: API_SUBJECT_URL + this.state.subject.subjectId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { subject, navigationDtl } = res.data;
                    this.setState({ subject, navigationDtl, saveButtonDisabled: true });
                    await this.populateSubjects();
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
                this.populateSubjectName(subject.parentSubjectId);
                this.setState({ subject, navigationDtl })
                console.log(this.state.subject);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateSubject = async (operation) => {
        const { saveButtonDisabled } = this.state;
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
            url: API_SUBJECT_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate subjects");
                res.data.forEach(element => {
                    subjects.push({
                        value: element.subjectId,
                        label: element.subjectName,
                        parent: element.parentSubjectId
                    });
                });
            }
            console.log("Subjects:", subjects);
        } catch (error) {
            console.log(error);
        }
        this.setState({ subjects });
    }

    populateSubjectName = (parentSubjectId) => {
        console.log("populateSubjectName called");
        console.log("Subject ID: ", parentSubjectId);

        let subjects = [...this.state.subjects];
        let subjectName = null;

        const result = subjects.filter(subject => subject.value === parentSubjectId);
        if (result[0] !== undefined && result[0] !== null) {
            subjectName = result[0].label;
        }
        this.setState({ subjectName });
    }

    excludeCurrentHierarchy = (subjectId) => {
        console.log("Subject ID", subjectId);

        let subjects = this.state.subjects;

        const rootArray = subjects.filter(s => s.value === subjectId);
        toBeExcluded.push(...rootArray);
        console.log("toBeExcluded length", toBeExcluded.length);

        const childrenArray = subjects.filter(s => s.parent === subjectId);
        console.log("childrenArray", childrenArray);

        if (childrenArray.length > 0) {
            childrenArray.map(s => {
                return this.excludeCurrentHierarchy(s.value);
            });
        } else {
            return;
        }
    }

    getSubjectsExcludeCurrentHierarchy = () => {
        toBeExcluded.length = 0;
        const currentSubject = { ...this.state.subject };

        if (currentSubject.subjectId !== null && currentSubject.subjectId !== undefined) {
            this.excludeCurrentHierarchy(currentSubject.subjectId);
        }
        console.log("Exc", toBeExcluded);
        const subjectsExcludeCurrent = this.state.subjects.filter(s => toBeExcluded.indexOf(s) === -1);
        this.setState({ subjectsExcludeCurrent });
    }

    render() {
        const { subject, navigationDtl, subjectsExcludeCurrent, subjectName } = this.state;

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
                            <InputGroup.Text style={inputGroupTextStyle}>Subject
                  ID</InputGroup.Text>
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
                            <InputGroup.Text style={inputGroupTextStyle}>Subject
                  Code</InputGroup.Text>
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
                            <InputGroup.Text style={inputGroupTextStyle}>Subject
                  Name</InputGroup.Text>
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
                            <InputGroup.Text style={inputGroupTextStyle}>Parent
                  Subject</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={stretchStyle}>
                            <Select
                                name="parentSubjectId"
                                placeholder="Select Parent Subject"
                                aria-label="Select Parent Subject"
                                value={{ value: subject.parentSubjectId || '', label: subjectName || '' }}
                                onChange={this.handleSubjectSelectChange}
                                onMenuOpen={this.getSubjectsExcludeCurrentHierarchy}
                                clearable={true}
                                options={subjectsExcludeCurrent}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text
                                style={inputGroupTextStyle}>Remarks</InputGroup.Text>
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
                            onClick={() => this.saveSubjectShowMessage(
                                "Subject saved successfully.")}
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