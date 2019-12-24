import React, { Component } from 'react';
import Footer from './common/footer';
import Navbar from './common/navbar';
import Author from './author';
import Subject from './subject';
import Publisher from './publisher';
import Researcher from './researcher';
import Shelf from './shelf';
import Book from './book';
import Dashboard from './common/dashboard';
import SearchBook from './searchBook';

class PageContent extends Component {

  checkPath = () => {
    const { pathname } = this.props;
    console.log("Path", pathname);

    if (pathname === "/" || pathname === "/dashboard") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Dashboard</h1><Dashboard /></>;
    } else if (pathname === "/author") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Author Registration</h1><Author /></>;
    } else if (pathname === "/subject") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Subject Registration</h1><Subject /></>;
    } else if (pathname === "/publisher") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Publisher Registration</h1><Publisher /></>;
    } else if (pathname === "/researcher") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Researcher Registration</h1><Researcher /></>;
    } else if (pathname === "/shelf") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Shelf Registration</h1><Shelf /></>;
    } else if (pathname === "/book") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Book Registration</h1><Book /></>;
    } else if (pathname === "/searchBook") {
      return <><h1 className="text-center h3 mb-4 text-gray-800">Search Book</h1><SearchBook /></>;
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