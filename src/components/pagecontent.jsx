import React, { Component } from 'react';
import Footer from './common/footer';
import Navbar from './common/navbar';
import Item from './item';
import Dashboard from './common/dashboard';
import Party from './party';
import PO from './po';

class PageContent extends Component {

  checkPath = () => {
    const { pathname } = this.props;
    console.log("Path", pathname);

    if (pathname === "/" || pathname === "/dashboard") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Dashboard</h1><Dashboard /></>;
    } else if (pathname === "/item") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Item Management</h1><Item /></>;
    } else if (pathname === "/party") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Party Management</h1><Party /></>;
    } else if (pathname === "/po") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Invoice Main (Purchase Order)</h1><PO /></>;
    }
  }
  render() {
    return (
      <div id="content-wrapper" className="d-flex flex-column">
        <Navbar  {...this.props}/>
        <div id="content">
          <div className="container-fluid">
            {this.checkPath()}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default PageContent;