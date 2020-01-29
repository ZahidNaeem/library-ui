/* eslint-disable no-console */
import React, { Component } from 'react';
import { FormControl, Button } from 'react-bootstrap';
import { sendRecoveryEmail } from './util/APIUtils';
import HttpStatus from 'http-status-codes';

class ForgotPassword extends Component {
  state = {
    email: '',
    message: ''
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    console.log(name, value);

    this.setState({
      [name]: value,
    });
  };

  sendEmail = async (e) => {
    e.preventDefault();
    const { email } = this.state;
    if (email === '') {
      this.setState({
        message: 'Email cannot be empty'
      });
    } else {
      try {
        const res = await sendRecoveryEmail(email);
        if (res.status === HttpStatus.OK) {
          this.setState({
            message: res.data.entity
          });
        }
      } catch (error) {
        console.error(error);
        if (error.response !== undefined) {
          this.setState({
            message: error.response.data.message
          });
        } else {
          this.setState({
            message: 'Unknow error occurred. Please contact support'
          });
        }
      }
    }
  };

  render() {
    const windowsHeight = {
      height: window.innerHeight + "px"
    }

    const { email, message } = this.state;

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
                          <h1 className="h4 text-gray-900 mb-4">Forgot Password</h1>
                        </div>
                        <form className="user"
                          onSubmit={this.sendEmail}>
                          <div className="form-group">
                            <FormControl
                              type="text"
                              // type="email"
                              className="form-control form-control-user"
                              name="email"
                              autoFocus
                              placeholder="Enter Registered Email..."
                              aria-label="Enter Registered Email..."
                              value={email}
                              onChange={this.handleChange}
                            />
                          </div>
                          <Button className="btn btn-primary btn-user btn-block"
                            type="submit">Reset Password
                                              </Button>
                        </form>
                        <br />
                        <div>
                          <p>{message}</p>
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
}

export default ForgotPassword;
