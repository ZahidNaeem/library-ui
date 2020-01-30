import React, { Component } from 'react';
import { FormControl, Button } from 'react-bootstrap';
import { storeDataIntoLocalStorage, retrieveDataFromLocalStorage, removeDataFromLocalStorage } from './util/APIUtils';
import { REMEMBER_ME, LOGIN_REQUEST } from './constant'
import FormItem from 'antd/lib/form/FormItem';
import Popup from './common/popup';
import Modal from './popup/model';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

class Login extends Component {
    constructor(props) {
        super(props);
        this.usernameOrEmailInput = React.createRef();
        this.state = {
            loginRequest: {
                usernameOrEmail: '',
                password: ''
            },
            loginDisabled: true,
            rememberMe: false,
            showPopup: false
        }
    }

    componentDidMount() {
        console.log("Current Object", this.usernameOrEmailInput.current);
        this.focusUsernameOrEmailInput();
        const rememberMe = retrieveDataFromLocalStorage(REMEMBER_ME);
        console.log("Remember Me", rememberMe);
        if (rememberMe === 'true') {
            const loginRequest = JSON.parse(retrieveDataFromLocalStorage(LOGIN_REQUEST));
            console.log("Login request", loginRequest);

            if (loginRequest) {
                this.setState({ loginRequest, rememberMe: true }, () => {
                    this.loginButtonStatus();
                });
                console.log("State", this.state.loginRequest);
            }

        } else {
            this.setState({ rememberMe: false });
        }
    }

    focusUsernameOrEmailInput = () => {
        this.usernameOrEmailInput.current.focus();
    }

    handleRememberMeChanges = (event) => {
        const rememberMe = event.target.checked;
        console.log("handleRememberMeChanges", rememberMe);
        this.setState({ rememberMe });
    }

    toggleRememberMe = () => {
        const { rememberMe } = this.state;
        if (rememberMe) {
            const { loginRequest } = this.state;
            storeDataIntoLocalStorage(REMEMBER_ME, true);
            storeDataIntoLocalStorage(LOGIN_REQUEST, JSON.stringify(loginRequest));
        } else {
            removeDataFromLocalStorage(LOGIN_REQUEST);
            storeDataIntoLocalStorage(REMEMBER_ME, false);
        }
    }

    handleChanges = (event) => {
        const { name, value } = event.target;
        let { loginRequest } = this.state;
        loginRequest[name] = value;
        this.setState({ loginRequest }, () => {
            this.loginButtonStatus();
        });
    }


    handleLogin = async (e) => {
        e.preventDefault();
        await this.props.handleLogin(this.state.loginRequest);
        this.toggleRememberMe();
    }

    loginButtonStatus = () => {
        let { loginRequest, loginDisabled } = this.state;

        if (loginRequest.usernameOrEmail.length > 3 && loginRequest.password.length > 3) {
            loginDisabled = false;
        } else {
            loginDisabled = true;
        }
        this.setState({ loginDisabled });
    }

    render() {
        const windowsHeight = {
            height: window.innerHeight + "px"
        }

        const { showPopup } = this.state;

        const registerPopup = showPopup === true ? (<Popup
            modalHeader={this.modalHeader}
            modalBody={this.modalBody}
            // modalFooter={this.modalFooter}
            show
            showCloseButton={false}
            closeButtonTitle="Close Button"
        />) : null;

        const showRegisterPopup = () => this.showRegisterPopup(true);

        return (<>
            <div className="bg-gradient-primary"
                style={windowsHeight}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-12 col-md-9">
                            <div className="card o-hidden border-0 shadow-lg my-5 col-md-6 offset-md-3">
                                <div className="card-body">
                                    {/* <!-- Nested Row within Card Body --> */}
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="p-5">
                                                <div className="text-center">
                                                    <h1 className="h4 text-gray-900 mb-4">Administration</h1>
                                                </div>
                                                <form className="user"
                                                    onSubmit={this.handleLogin}>
                                                    <div className="form-group">
                                                        <FormControl
                                                            type="text"
                                                            // type="email"
                                                            className="form-control form-control-user"
                                                            name="usernameOrEmail"
                                                            placeholder="Enter Username/Email..."
                                                            aria-label="Enter Username/Email..."
                                                            ref={this.usernameOrEmailInput}
                                                            value={this.state.loginRequest.usernameOrEmail || ''}
                                                            onChange={this.handleChanges}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <FormControl
                                                            type="password"
                                                            className="form-control form-control-user"
                                                            name="password"
                                                            placeholder="Password"
                                                            aria-label="Password"
                                                            value={this.state.loginRequest.password || ''}
                                                            onChange={this.handleChanges}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <div className="custom-control custom-checkbox small">
                                                            <input type="checkbox"
                                                                className="custom-control-input"
                                                                checked={this.state.rememberMe}
                                                                onChange={this.handleRememberMeChanges}
                                                                id="rememberMe"
                                                            />
                                                            <label className="custom-control-label"
                                                                htmlFor="rememberMe">Remember Me</label>
                                                        </div>
                                                    </div>
                                                    <Button className="btn btn-primary btn-user btn-block"
                                                        disabled={this.state.loginDisabled}
                                                        type="submit">Login
                                                    </Button>
                                                </form>
                                                <hr />
                                                <div className="text-center">
                                                    <a className="small"
                                                        href="/forgotPassword">Forgot Password?</a>
                                                </div>
                                                <div className="text-center">
                                                    <br />
                                                    <FormItem className="small">
                                                        Not a member?&nbsp;
                                                        <Link
                                                            to="/signup"
                                                        // onClick={showRegisterPopup}
                                                        >
                                                            Register
                                                            </Link>
                                                        {registerPopup}
                                                    </FormItem>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    modalHeader = () => {
        console.log('Entered in modelHeader');

        return <Modal.Title><p>Login</p></Modal.Title>;
    }

    modalBody = () => {
        return <Link
            to="/signup">
            Register as Buyer
        </Link>;
    }

    /* modalFooter = () => {
        return <Button
            btnStyle="default"
            onClick={() => this.handleRegisterPopup(false)}
        >
            Close
    </Button>;
    } */

    showRegisterPopup = (bool) => {
        this.setState({ showPopup: bool })
    }


}

export default Login;