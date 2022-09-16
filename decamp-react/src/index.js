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
import PoolList from './components/pool_list';


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
            <Route path="/editor" element={(
              <div>
                <Navbar />
                <Row>
                  <Col>

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