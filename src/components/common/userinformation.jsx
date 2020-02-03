import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class UserInformation extends Component {
  render() {
    const currentUser = this.props.currentUser;
    const userName = currentUser !== null ? currentUser.name : 'Unknown';

    return (<li className="nav-item dropdown no-arrow">
      <Link className="nav-link dropdown-toggle" to="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span className="mr-2 d-none d-lg-inline text-gray-600 small">{userName}</span>
        {/* <img className="img-profile rounded-circle" src="https://source.unsplash.com/QAB-WJcbgJk/60x60" alt="profile pic"/> */}
        <img className="img-profile rounded-circle" src="https://via.placeholder.com/150/0000FF/808080 ?Text=" alt="profile pic" />
      </Link>
      <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
        {/* <Link className="dropdown-item" to="#">
          <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
          Profile
        </Link>
        <Link className="dropdown-item" to="#">
          <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
          Settings
        </Link>
        <Link className="dropdown-item" to="#">
          <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
          Activity Log
        </Link>
        <div className="dropdown-divider"></div> */}
        <Link className="dropdown-item" to="#" data-toggle="modal" data-target="#changePasswordModal">
          <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
          Change Password
        </Link>
        <Link className="dropdown-item" to="#" data-toggle="modal" data-target="#logoutModal">
          <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
          Logout
        </Link>
      </div>
    </li>);
  }
}
export default UserInformation;