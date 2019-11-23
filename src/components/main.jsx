import React, { Component } from 'react';
import SideBar from './common/sidebar';
import PageContent from './pagecontent';
import { Form, FormControl } from 'react-bootstrap';

class Main extends Component {
    state = {
        changePasswordRequest: {
            currentPassword: '',
            newPassword: ''
        },
        confirmPassword: '',
        changePasswordDisabled: true
    }

    handleChanges = (event) => {
        const { name, value } = event.target;
        let { changePasswordRequest, confirmPassword, changePasswordDisabled } = this.state;
        if (name === 'confirmPassword') {
            confirmPassword = value;
        } else {
            changePasswordRequest[name] = value;
        }

        if (changePasswordRequest.currentPassword.length > 5
            && changePasswordRequest.newPassword.length > 5
            && changePasswordRequest.newPassword.length <= 100
            && changePasswordRequest.newPassword === confirmPassword) {
            changePasswordDisabled = false;
        } else {
            changePasswordDisabled = true;
        }
        this.setState({ changePasswordRequest, confirmPassword, changePasswordDisabled });
    }

    handleLogout = () => {
        this.props.handleLogout();
    }

    handleChangePassword = () => {
        this.props.handleChangePassword(this.state.changePasswordRequest);
    }

    render() {
        return (<>
            <div id="page-top">
                <div id="wrapper">
                    <SideBar />
                    <PageContent pathname={this.props.location.pathname} {...this.props} />
                    <a className="scroll-to-top rounded"
                        href="#page-top">
                        <i className="fas fa-angle-up"></i>
                    </a>
                    <div className="modal fade"
                        id="logoutModal"
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="logoutModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog"
                            role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"
                                        id="logoutModalLabel">Ready to Leave?</h5>
                                    <button className="close"
                                        type="button"
                                        data-dismiss="modal"
                                        aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">Select "Logout"
                                below if you are ready to end your current session.</div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary"
                                        type="button"
                                        data-dismiss="modal">Cancel
                                        </button>
                                    <button className="btn btn-primary"
                                        type="button"
                                        onClick={this.handleLogout}
                                        data-dismiss="modal">Logout
                                        </button>
                                    {/* <a className="btn btn-primary"
                                    onClick={this.handleLogout}
                                        href="/">Logout</a> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ---------------------- */}
                    <div className="modal fade"
                        id="changePasswordModal"
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="changePasswordModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog"
                            role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"
                                        id="changePasswordModalLabel">Change Password</h5>
                                    <button className="close"
                                        type="button"
                                        data-dismiss="modal"
                                        aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    To enable change button, please fill the form properly
				</div>
                                <Form className="user">
                                    <div className="form-group">
                                        <FormControl
                                            type="password"
                                            className="form-control form-control-user"
                                            name="currentPassword"
                                            placeholder="Current Password"
                                            aria-label="Current Password"
                                            value={this.state.changePasswordRequest.currentPassword || ''}
                                            onChange={this.handleChanges}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <FormControl
                                            type="password"
                                            className="form-control form-control-user"
                                            name="newPassword"
                                            placeholder="New Password"
                                            aria-label="New Password"
                                            value={this.state.changePasswordRequest.newPassword || ''}
                                            onChange={this.handleChanges}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <FormControl
                                            type="password"
                                            className="form-control form-control-user"
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            aria-label="Confirm Password"
                                            value={this.state.confirmPassword || ''}
                                            onChange={this.handleChanges}
                                        />
                                    </div>
                                </Form>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary"
                                        type="button"
                                        data-dismiss="modal">Cancel
                        </button>
                                    <button className="btn btn-primary"
                                        type="button"
                                        onClick={this.handleChangePassword}
                                        disabled={this.state.changePasswordDisabled}
                                        data-dismiss="modal">Change
                        </button>
                                    {/* <a className="btn btn-primary"
                    onClick={this.handleChangePassword}
                        href="/">Change</a> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }
}

export default Main;