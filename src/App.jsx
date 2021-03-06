import React, { Component } from 'react';
// import { Route, Switch, Redirect } from "react-router-dom";
import { Route, withRouter, Switch } from "react-router-dom";
import { toast } from 'react-toastify';
import Main from './components/main';
import Login from './components/login';
import { login, changePassword, getCurrentUser, isSuccessfullResponse, storeDataIntoLocalStorage, removeDataFromLocalStorage, retrieveDataFromLocalStorage } from './components/util/APIUtils';
import { ACCESS_TOKEN, CURRENT_USER } from './components/constant';
import NotFound from './components/common/NotFound'
import ForgotPassword from './components/forgotPassword';
import Signup from './components/Signup';

class App extends Component {

    state = {
        isAuthenticated: false,
        isLoading: false
    }

    loadCurrentUser = async () => {
        this.setState({
            isLoading: true
        });
        try {
            const res = await getCurrentUser();
            if (isSuccessfullResponse(res)) {
                storeDataIntoLocalStorage(CURRENT_USER, JSON.stringify(res.data));
                this.setState({
                    isAuthenticated: true,
                    isLoading: false
                });
            }
        } catch (error) {
            this.setState({
                isLoading: false
            });
        }
    }

    handleLogin = async (loginRequest) => {
        const { usernameOrEmail, password } = loginRequest;
        if (usernameOrEmail.length > 0 && password.length > 0) {
            try {
                const res = await login(loginRequest);
                if (isSuccessfullResponse(res)) {
                    storeDataIntoLocalStorage(ACCESS_TOKEN, res.data.accessToken);
                    await this.loadCurrentUser();
                    let { pathname } = this.props.location;
                    console.log("Path before change", pathname);

                    if (pathname === '/login') {
                        pathname = '/';
                    }
                    console.log("Path after change", pathname);
                    this.props.history.push(pathname);
                    // this.context.router.push('/item');
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    handleLogout = async (redirectTo = "/") => {
        removeDataFromLocalStorage(ACCESS_TOKEN);
        removeDataFromLocalStorage(CURRENT_USER);

        this.setState({
            isAuthenticated: false
        });

        this.props.history.push(redirectTo);
    }

    handleChangePassword = async (changePasswordRequest) => {
        try {
            const res = await changePassword(changePasswordRequest);
            if (isSuccessfullResponse(res)) {
                if (res) {
                    toast.success("Password changed successfully.");
                }
            } else {
                console.log("Save item response code", res.status);
            }
        } catch (error) {
            console.log(error.response.data);
            toast.error(error.response.data.message);

        }
    }

    render() {
        toast.configure({
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });

        const currentUserSaved = retrieveDataFromLocalStorage(CURRENT_USER);

        const currentUser = currentUserSaved !== null && currentUserSaved !== undefined ? JSON.parse(currentUserSaved) : null;
        console.log("Current user", currentUser);


        if (currentUser !== null) {
            return (
                <Switch>
                    {/* <Route exact path="/" render={(props) => <Main {...props} handleLogout={this.handleLogout} />} /> */}
                    <Route exact path="(/|/item|/party|/po|/dashboard)"
                        render={(props) =>
                            <Main {...props}
                                currentUser={currentUser}
                                handleLogout={this.handleLogout}
                                handleChangePassword={this.handleChangePassword} />} />
                    <Route component={NotFound}></Route>
                    {/* <Route path="/party" render={(props) => <Main {...props} handleLogout={this.handleLogout} />} />
                    <Route path="/po" render={(props) => <Main {...props} handleLogout={this.handleLogout} />} />
                    <Route path="/dashboard" render={(props) => <Main {...props} handleLogout={this.handleLogout} />} /> */}
                </Switch>
            )
        } else {
            return (
                <Switch>
                    <Route path="/forgotPassword" render={(props) => <ForgotPassword {...props} handleLogin={this.handleLogin} />} />
                    <Route path="/signup" render={(props) => <Signup {...props} handleLogin={this.handleLogin} />} />
                    <Route path="/" render={(props) => <Login {...props} handleLogin={this.handleLogin} />} />
                </Switch>
            )
        }
    }
}

export default withRouter(App);