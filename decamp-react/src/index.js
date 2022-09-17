//import libs
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
//style sheets
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styling/index.css";
//import custom components
import Navbar from './components/navbar';
//import bootstrap styling components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PoolList from './components/members/member_pool_list';
import ProposalList from './components/projects/proposal_list';
import ProjectList from './components/projects/project_list';
import ApplicationList from './components/members/applicant_list';
import ProposalView from './components/projects/proposal';
import Treasury from './components/treasury';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div>
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <PoolList />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/treasury" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <Treasury />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/pool/:id" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>

                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/applicants" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <ApplicationList />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/applicant/:id" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>

                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/projects" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <ProjectList />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/project/:id" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>

                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/proposals" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <ProposalList />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/proposal/:id" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <ProposalView />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
          </Routes>
        </BrowserRouter>
      </Container>
    </div >
  </React.StrictMode>
);