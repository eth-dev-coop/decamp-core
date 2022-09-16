import React, { useEffect, useRef, useState } from "react";
import Web3 from 'web3';
import ABI from '../web3/abi.json';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useNavigate } from 'react-router-dom';
import CampaignListItem from "./campaign_list_item";
import detectEthereumProvider from '@metamask/detect-provider';


const CampaignList = (props) => {

    const factoryContract = useRef(null);
    const [campaigns, setCampaigns] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        window.ethereum.on('accountsChanged', init);
        window.ethereum.on('connect', init);
        init();
        return () => {
            window.ethereum.removeListener('accountsChanged', init);
            window.ethereum.removeListener('connect', init);
        };
    }, []);

    const init = async () => {
        const provider = await detectEthereumProvider();
        setIsConnected(provider && provider.selectedAddress);
        const web3 = new Web3(window.ethereum);
        factoryContract.current = new web3.eth.Contract(ABI.factoryABI, ABI.factoryAddress);
        var campaigns = await factoryContract.current.methods.getActiveCampaigns().call();
        setCampaigns(campaigns);
    };

    const onCampaignSelect = async (campaign) => {
        navigate("/" + campaign);
    };

    const campaignItemsMap = campaigns.map((campaign) => {
        return <CampaignListItem
            onCampaignSelect={onCampaignSelect}
            key={campaign}
            campaign={campaign}
        />
    });

    return (
        <div>
            <br />
            <Row>
                <Col md={{ offset: 10 }}>
                    {isConnected &&
                        <Link className="btn btn-danger" to="/editor" onClick={(e) => { navigate("/editor"); }}>
                            Create
                        </Link>
                    }
                </Col>
            </Row>
            <br />
            <Row className="Campaign-List-Header">
                <Col md="1">

                </Col>
                <Col md="1">
                    <small>Balance</small>
                </Col>
                <Col md="2">
                    <small>Contract</small>
                </Col>
                <Col md="6">
                    <small>Descrption</small>
                </Col>
                <Col md="2">
                    <small>Creator</small>
                </Col>
            </Row>
            <Container className="Campaign-List">
                <div className="Campaign-List-Inner">
                    {campaignItemsMap}
                </div>
            </Container>
        </div>
    );
};

export default CampaignList;