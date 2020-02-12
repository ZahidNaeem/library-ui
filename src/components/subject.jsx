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
import MySelect from './common/select'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { getCurrentUser, request } from './util/APIUtils'
import {
    API_SUBJECT_URL,
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

let toBeExcluded = [];
class Subject extends Component {

    state = {
        subject: {},
        subjects: [],
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
        await this.populateSubjects();
        await this.firstSubject();
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

            console.log("Current User: ", res.data.entity);
            return res.data.entity;
        } catch (error) {
            console.log(error);
        }
    }

    handleSubjectChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const subject = { ...this.state.subject };
        subject[name] = name === 'subjectName' ? value.toUpperCase() : name === 'purchased' ? parseInt(value) : value;
        this.setState({ subject });
        this.enableSaveUndoButton();
    }

    handleSelectChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const { subject } = this.state;
        subject[name] = value;
        this.setState({ subject });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { subject } = this.state;
        return !(subject.subjectName === undefined || subject.subjectName === null || subject.subjectName === '');
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    disableAddButton = (boolean) => {
        this.setState({ addButtonDisabled: boolean });
    }

    /*     handleSubjectSelectChange = (selectedSubject, name) => {
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
        }; */

    addSubject = () => {
        const subject = {};
        this.setState({ subject, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    saveSubject = async () => {
        let saveResponse = {};
        if (this.validateForm() === false) {
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

                console.log("Post: Object received: ", res.data.entity);
                const { subject, navigationDtl } = res.data.entity;
                this.setState({ subject, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                this.disableAddButton(false);
                saveResponse = res.data;
            } catch (error) {
                // throw error.response.data;
                saveResponse = error.response.data;
            }
        }
        return saveResponse;
    }

    saveSubjectShowMessage = async () => {
        try {
            const saveResponse = await this.saveSubject();
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

    deleteSubject = async () => {
        const subject = { ...this.state.subject };
        if (subject.subjectId !== undefined && subject.subjectId !== null) {
            console.log("Delete: Subject ID sent: ", subject.subjectId);
            const options = {
                url: API_SUBJECT_URL + subject.subjectId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);

                console.log("Delete: Response: ", res);
                const { subject, navigationDtl } = res.data.entity;
                this.setState({ subject, navigationDtl, saveButtonDisabled: true });
                this.disableAddButton(false);
                await this.populateSubjects();
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || 'Sorry! Something went wrong. Please try again or contact administrator.');
                return;
            }
        } else {
            this.undoChanges();
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

            const { subject, navigationDtl } = res.data.entity;
            // this.populateSubjectName(subject.parentSubjectId);
            this.setState({ subject, navigationDtl })
            console.log(this.state.subject);
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

    firstSubject = async () => {
        await this.saveAndNavigateSubject('first');
    }

    previousSubject = async () => {
        await this.saveAndNavigateSubject('previous');
    }

    nextSubject = async () => {
        await this.saveAndNavigateSubject('next');
    }

    lastSubject = async () => {
        await this.saveAndNavigateSubject('last');
    }

    undoChanges = () => {
        const subject = { ...this.state.subject };
        this.setState({ saveButtonDisabled: true });
        if (subject.subjectId != null) {
            const operation = subject.subjectId;
            this.navigateSubject(operation);
        } else {
            this.firstSubject();
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

    async populateSubjects() {
        console.log("Start populate subjects");
        const subjects = [];
        const options = {
            url: API_SUBJECT_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);

            console.log("Stop populate subjects");
            res.data.entity.forEach(element => {
                subjects.push({
                    value: element.subjectId,
                    label: element.subjectName,
                    parent: element.parentSubjectId
                });
            });
            console.log("Subjects:", subjects);
        } catch (error) {
            console.log(error);
        }
        this.setState({ subjects });
    }

    /*     populateSubjectName = (parentSubjectId) => {
            console.log("populateSubjectName called");
            console.log("Subject ID: ", parentSubjectId);
    
            let subjects = [...this.state.subjects];
            let subjectName = null;
    
            const result = subjects.filter(subject => subject.value === parentSubjectId);
            if (result[0] !== undefined && result[0] !== null) {
                subjectName = result[0].label;
            }
            this.setState({ subjectName });
        } */

    excludeCurrentHierarchy = (subjectId) => {
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
        return subjectsExcludeCurrent;
        // this.setState({ subjectsExcludeCurrent });
    }

    render() {
        const { subject, navigationDtl, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Subject ID
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectId"
                            placeholder="Subject ID"
                            aria-label="Subject ID"
                            readOnly
                            value={subject.subjectId || ''}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup> */}

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Subject
                  Code</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectCode"
                            placeholder="Subject Code"
                            aria-label="Subject Code"
                            value={subject.subjectCode || ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Subject Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="subjectName"
                            placeholder="Subject Name"
                            aria-label="Subject Name"
                            value={subject.subjectName || ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Parent Subject</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="parentSubjectId"
                                placeholder="Select Parent Subject"
                                value={subject.parentSubjectId}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={this.getSubjectsExcludeCurrentHierarchy()}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text
                                style={INPUT_GROUP_TEXT_STYLE}>Remarks</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="textarea"
                            rows="3"
                            name="remarks"
                            placeholder="Remarks"
                            aria-label="Remarks"
                            value={subject.remarks || ''}
                            disabled={fieldsDisabled}
                            onChange={this.handleSubjectChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstSubject}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousSubject}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextSubject}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastSubject}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addSubject}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ subjectAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
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
                            onClick={this.saveSubjectShowMessage}
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

                </Form>
            </>
        );
    }
}

export default Subject;