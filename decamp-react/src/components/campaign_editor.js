import React, { useState, useEffect, useRef } from 'react';
import ABI from '../web3/abi.json';
import Web3 from 'web3';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';


const CampaignEditor = (props) => {

    const [campaignSummary, setCampaignSummary] = useState("");
    const [showLoadingIcon, setShowLoadingIcon] = useState(false);
    const factoryContract = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            const web3 = new Web3(window.ethereum);
            factoryContract.current = new web3.eth.Contract(ABI.factoryABI, ABI.factoryAddress);
        };
        init();
    }, []);

    const onEditorSubmit = async (e) => {
        setShowLoadingIcon(true);
        e.preventDefault();
        if (!campaignSummary) {
            return;
        }
        await factoryContract.current.methods.createCampaign(campaignSummary).send({
            from: window.ethereum.selectedAddress
        });
        setCampaignSummary("");
        setShowLoadingIcon(false);
        navigate("/");
    };

    const onEditorCancel = () => {
        setCampaignSummary("");
        navigate("/");
    };

    return (
        <div>
            <br />
            <Form onSubmit={onEditorSubmit}>
                <Form.Group className="mb-3" controlId="formShortDescription">
                    <Form.Label></Form.Label>
                    <Form.Control
                        value={campaignSummary}
                        onChange={(e) => { setCampaignSummary(e.target.value) }}
                        as="textarea"
                        placeholder="Please describe your idea..."
                        style={{ height: '100px' }}
                    />
                </Form.Group>
                <Row>
                    <Col md={{ offset: 7 }}>

                    </Col>
                    <Col md="4">
                        <div className='goRight'>
                            {showLoadingIcon && <div className='loader'></div>}
                            {!showLoadingIcon &&
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            }
                            &nbsp;
                            {!showLoadingIcon &&

                                <Button onClick={onEditorCancel} variant="warning">
                                    Cancel
                                </Button>
                            }

                        </div>


                    </Col>
                    <Col md="1">

                    </Col>
                </Row>
            </Form>
        </div>
    );

};

export default CampaignEditor;