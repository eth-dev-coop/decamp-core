//import libs
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
//style sheets
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styling/index.css";
//import custom components
import Navbar from './components/navbar';
import CampaignViewer from './components/campaign_viewer';
import CampaignList from './components/campaign_list';
import CampaignEditor from './components/campaign_editor';
//import bootstrap styling components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


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
                    <CampaignList />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/editor" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <CampaignEditor />
                  </Col>
                </Row>
              </div>
            )}>
            </Route>
            <Route path="/:id" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>
                    <CampaignViewer />
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