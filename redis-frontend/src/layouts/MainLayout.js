import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Offcanvas,
} from "react-bootstrap";
import {
  FaChartBar,
  FaUsers,
  FaHome,
  FaUserFriends,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setShowSidebar(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
        <Button
          variant="primary"
          className="d-lg-none me-2"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <FaBars />
        </Button>
        <Navbar.Brand as={Link} to="/dashboard">
          Barangay Management System
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Item className="d-flex align-items-center text-white me-3">
              <FaUser className="me-2" /> {currentUser?.name || "User"}
            </Nav.Item>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="flex-grow-1 px-0">
        <Row className="g-0 h-100">
          {/* Sidebar - Desktop */}
          <Col lg={3} xl={2} className="bg-dark text-white d-none d-lg-block">
            <Nav className="flex-column py-3">
              <Nav.Link
                as={Link}
                to="/dashboard"
                className={`d-flex align-items-center py-3 px-3 ${
                  isActive("/dashboard") && !isActive("/dashboard/")
                    ? "bg-primary"
                    : ""
                }`}
              >
                <FaChartBar className="me-3" /> Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/family-heads"
                className={`d-flex align-items-center py-3 px-3 ${
                  isActive("/dashboard/family-heads") ? "bg-primary" : ""
                }`}
              >
                <FaUserFriends className="me-3" /> Family Heads
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/residents"
                className={`d-flex align-items-center py-3 px-3 ${
                  isActive("/dashboard/residents") ? "bg-primary" : ""
                }`}
              >
                <FaUsers className="me-3" /> Residents
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/profile"
                className={`d-flex align-items-center py-3 px-3 ${
                  isActive("/dashboard/profile") ? "bg-primary" : ""
                }`}
              >
                <FaUser className="me-3" /> Profile
              </Nav.Link>
            </Nav>
          </Col>

          {/* Sidebar - Mobile */}
          <Offcanvas
            show={showSidebar}
            onHide={closeSidebar}
            responsive="lg"
            className="bg-dark text-white"
            style={{ width: "250px" }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  className={`d-flex align-items-center py-3 px-3 ${
                    isActive("/dashboard") && !isActive("/dashboard/")
                      ? "bg-primary"
                      : ""
                  }`}
                  onClick={closeSidebar}
                >
                  <FaChartBar className="me-3" /> Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/dashboard/family-heads"
                  className={`d-flex align-items-center py-3 px-3 ${
                    isActive("/dashboard/family-heads") ? "bg-primary" : ""
                  }`}
                  onClick={closeSidebar}
                >
                  <FaUserFriends className="me-3" /> Family Heads
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/dashboard/residents"
                  className={`d-flex align-items-center py-3 px-3 ${
                    isActive("/dashboard/residents") ? "bg-primary" : ""
                  }`}
                  onClick={closeSidebar}
                >
                  <FaUsers className="me-3" /> Residents
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/dashboard/profile"
                  className={`d-flex align-items-center py-3 px-3 ${
                    isActive("/dashboard/profile") ? "bg-primary" : ""
                  }`}
                  onClick={closeSidebar}
                >
                  <FaUser className="me-3" /> Profile
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={9} xl={10} className="px-4 py-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainLayout;
