import React, { useEffect, useRef, useState } from "react";
import Web3 from 'web3';
import ABI from '../web3/abi.json';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useNavigate } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import Button from 'react-bootstrap/Button';

const PoolList = (props) => {

    const memberPoolFactoryContract = useRef(null);
    const [pools, setPools] = useState([]);
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
        memberPoolFactoryContract.current = new web3.eth.Contract(ABI.memberPoolFactoryABI, ABI.memberPoolFactoryAddress);
        var pools = await memberPoolFactoryContract.current.methods.getMemberPools().call();
        setPools(pools);
    };

    const onPoolClick = async (e) => {
        await memberPoolFactoryContract.current.methods.createMemberPool("Test").send({ from: window.ethereum.selectedAddress })
        var pools = await memberPoolFactoryContract.current.methods.getMemberPools().call();
        setPools(pools);
    };

    const poolMap = pools.map((campaign) => {
        return (
            <Row>Pool Address = {campaign}</Row>
        )
    });

    return (
        <Row>
            <Col>
                <Button onClick={onPoolClick}>Create Pool</Button>
                {poolMap}
            </Col>
        </Row>

    );

};


export default PoolList;