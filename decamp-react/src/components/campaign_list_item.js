import React, { useState, useEffect } from "react";
import Web3 from 'web3';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jazzicon from 'react-jazzicon';
import ABI from '../web3/abi.json';


const CampaignListItem = (props) => {

    const [creator, setCreator] = useState("");
    const [balance, setBalance] = useState(0);
    const [description, setDescription] = useState("");

    function getShortAccountAddress(address) {
        var firstFour = address.slice(0, 5);
        var lastFour = address.slice(-5);
        return firstFour + "..." + lastFour;
    }

    let campaignContract;
    let web3;

    useEffect(() => {

        const init = async () => {
            web3 = web3 = new Web3(window.ethereum);
            campaignContract = new web3.eth.Contract(ABI.campaignABI, props.campaign);
            setCreator(await campaignContract.methods.creator().call());
            setDescription(await campaignContract.methods.description().call());
            setBalance(await web3.eth.getBalance(props.campaign));
        };
        init();

    }, []);


    return (
        <div>
            <Row className="Campaign-List-Row" onClick={() => { props.onCampaignSelect(props.campaign) }}>
                <Col md="1" className="Campaign-List-Col">
                    <Jazzicon
                        diameter={26}
                        seed={parseInt(props.campaign.slice(2, 10), 16)}
                    />
                </Col>
                <Col md="1">
                    {(balance / 1000000000000000000)}ETH
                </Col>
                <Col md="2">
                    {getShortAccountAddress(props.campaign)}
                </Col>
                <Col md="6">
                    {description}
                </Col>
                <Col md="2">
                    {getShortAccountAddress(creator)}
                </Col>
            </Row>
        </div>

    );
};


export default CampaignListItem;