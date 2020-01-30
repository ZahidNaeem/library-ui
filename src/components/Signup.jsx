import React, { Component } from 'react';
import { signup, checkUsernameAvailability, checkEmailAvailability, isSuccessfullResponse } from './util/APIUtils';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './common/footer';
import {
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    INPUT_GROUP_TEXT_STYLE
} from './constant';
import {
    Button,
    ButtonToolbar,
    Form,
    FormControl,
    InputGroup,
    FormGroup
} from 'react-bootstrap';

class Signup extends Component {
    state = {
        name: {
            value: ''
        },
        username: {
            value: ''
        },
        email: {
            value: ''
        },
        password: {
            value: ''
        },
        organization: {
            value: ''
        },
        role: []
    }


    handleInputChange = (event, validationFun) => {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        this.setState({
            [inputName]: {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        const { name, username, email, password, role } = this.state;

        const signupRequest = {
            name: name.value,
            username: username.value,
            email: email.value,
            password: password.value,
            organization: 1,
            role: [...role]
        };
        try {
            const res = await signup(signupRequest);
            console.log("Response:", res);

            if (isSuccessfullResponse(res)) {
                toast.success(res.data.message);
                this.props.history.push("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Sorry! Something went wrong. Please try again!');
        }
    }

    isFormInvalid = () => {
        return !(this.state.name.validateStatus === 'success' &&
            this.state.username.validateStatus === 'success' &&
            this.state.email.validateStatus === 'success' &&
            this.state.password.validateStatus === 'success'
        );
    }

    render() {
        return (
            <div id="content-wrapper" className="d-flex flex-column">
                <h1 className="text-center mb-4 text-gray-800">Sign Up</h1>
                <div id="content">
                    <div className="container-fluid">
                        <Form onSubmit={this.handleSubmit} className="signup-form">
                            <FormGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Full Name</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        name="name"
                                        placeholder="Your full name"
                                        value={this.state.name.value}
                                        onChange={(event) => this.handleInputChange(event, this.validateName)}
                                    />
                                </InputGroup>
                                {this.state.name.errorMsg}
                            </FormGroup>

                            <FormGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Username</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        name="username"
                                        autoComplete="off"
                                        placeholder="A unique username"
                                        value={this.state.username.value}
                                        onBlur={this.validateUsernameAvailability}
                                        onChange={(event) => this.handleInputChange(event, this.validateUsername)}
                                    />
                                </InputGroup>
                                {this.state.username.errorMsg}
                            </FormGroup>

                            <FormGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Username</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        placeholder="Your email"
                                        value={this.state.email.value}
                                        onBlur={this.validateEmailAvailability}
                                        onChange={(event) => this.handleInputChange(event, this.validateEmail)}
                                    />
                                </InputGroup>
                                {this.state.email.errorMsg}
                            </FormGroup>

                            <FormGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Username</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        name="password"
                                        type="password"
                                        autoComplete="off"
                                        placeholder="A password between 6 to 20 characters"
                                        value={this.state.password.value}
                                        onChange={(event) => this.handleInputChange(event, this.validatePassword)}
                                    />
                                </InputGroup>
                                {this.state.password.errorMsg}
                            </FormGroup>

                            <ButtonToolbar>
                                <Button
                                    type="submit"
                                    size="large"
                                    className="signup-form-button"
                                    disabled={this.isFormInvalid()}>Sign up</Button>
                            </ButtonToolbar>
                            Already registed? <Link to="/login">Login now!</Link>
                        </Form>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Validation Functions

    validateName = (name) => {
        if (name.length < NAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
            }
        } else if (name.length > NAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }

    validateEmail = (email) => {
        if (!email) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email may not be empty'
            }
        }

        const EMAIL_REGEX = RegExp('[^@ ]+@[^@ ]+\\.[^@ ]+');
        if (!EMAIL_REGEX.test(email)) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email not valid'
            }
        }

        if (email.length > EMAIL_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Email is too long (Maximum ${EMAIL_MAX_LENGTH} characters allowed)`
            }
        }

        return {
            validateStatus: null,
            errorMsg: null
        }
    }

    validateUsername = (username) => {
        if (username.length < USERNAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Username is too short (Minimum ${USERNAME_MIN_LENGTH} characters needed.)`
            }
        } else if (username.length > USERNAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Username is too long (Maximum ${USERNAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: null,
                errorMsg: null
            }
        }
    }

    validateUsernameAvailability = async () => {
        // First check for client side errors in username
        const usernameValue = this.state.username.value;
        const usernameValidation = this.validateUsername(usernameValue);

        if (usernameValidation.validateStatus === 'error') {
            this.setState({
                username: {
                    value: usernameValue,
                    ...usernameValidation
                }
            });
            return;
        }

        this.setState({
            username: {
                value: usernameValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });

        try {
            const res = await checkUsernameAvailability(usernameValue);

            if (isSuccessfullResponse(res)) {
                if (res.data.entity === true) {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'error',
                            errorMsg: 'This username is already taken'
                        }
                    });
                }
            }
        } catch (error) {
            // Marking validateStatus as success, Form will be recchecked at server
            this.setState({
                username: {
                    value: usernameValue,
                    validateStatus: 'success',
                    errorMsg: null
                }
            });
        }
    }

    validateEmailAvailability = async () => {
        // First check for client side errors in email
        const emailValue = this.state.email.value;
        const emailValidation = this.validateEmail(emailValue);

        if (emailValidation.validateStatus === 'error') {
            this.setState({
                email: {
                    value: emailValue,
                    ...emailValidation
                }
            });
            return;
        }

        this.setState({
            email: {
                value: emailValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });
        try {
            const res = await checkEmailAvailability(emailValue);
            if (isSuccessfullResponse(res)) {
                if (res.data.entity === true) {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'error',
                            errorMsg: 'This Email is already registered'
                        }
                    });
                }
            }
        } catch (error) {
            // Marking validateStatus as success, Form will be recchecked at server
            this.setState({
                email: {
                    value: emailValue,
                    validateStatus: 'success',
                    errorMsg: null
                }
            });
        }
    }

    validatePassword = (password) => {
        if (password.length < PASSWORD_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Password is too short (Minimum ${PASSWORD_MIN_LENGTH} characters needed.)`
            }
        } else if (password.length > PASSWORD_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Password is too long (Maximum ${PASSWORD_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }
}

export default Signup;