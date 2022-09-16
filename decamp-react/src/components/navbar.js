import React, { useState, useEffect, useRef, useReducer } from "react";
import Navbar from 'react-bootstrap/Navbar';
import ABI from '../web3/abi.json';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Jazzicon from 'react-jazzicon';
import Web3 from 'web3';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";
import { useNavigate, useParams } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';

const NavBar = (props) => {

    const [balance, setBalance] = useState(0);
    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const web3 = useRef(null);
    const [displayAddress, setDisplayAddress] = useState("");
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        window.ethereum.on('accountsChanged', onConnect);
        window.ethereum.on('connect', onConnect);
        onConnect();
        return () => {
            window.ethereum.removeListener('accountsChanged', onConnect);
            window.ethereum.removeListener('connect', onConnect);
        };
    }, []);

    async function onConnect() {
        const provider = await detectEthereumProvider();
        if (provider && provider.selectedAddress) {
            setDisplayAddress(getShortAccountAddress(window.ethereum.selectedAddress));
            setIsConnected(true);
            web3.current = new Web3(window.ethereum);
            const balance = await web3.current.eth.getBalance(window.ethereum.selectedAddress);
            setBalance((balance / 1000000000000000000).toFixed(3));
            setJazzIconInt(parseInt(window.ethereum.selectedAddress.slice(2, 10), 16));
            if (params.id) {
                var campaignContract = new web3.current.eth.Contract(ABI.campaignABI, params.id);
                campaignContract.events.UserRefunded(async (e) => { })
                    .on('data', async function (event) {
                        const balance = await web3.current.eth.getBalance(window.ethereum.selectedAddress);
                        setBalance((balance / 1000000000000000000).toFixed(3));
                    })
                    .on('error', function (error, receipt) {
                        console.log(error);
                    });
            }
        } else {
            setIsConnected(false);
        }

    }

    function getShortAccountAddress(address) {
        if (address) {
            var firstFour = address.slice(0, 5);
            var lastFour = address.slice(-4);
            return firstFour + "..." + lastFour;
        }
    }

    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };

    return (
        <div>
            <Navbar variant="dark" expand="lg" className="navbar-custom">
                <Container>
                    <Navbar.Brand className="cursorP" onClick={() => { navigate("/") }}>decamp</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Nav>
                        <Nav.Link>token</Nav.Link>
                        <Nav.Link>faucet</Nav.Link>
                        <Nav.Link>mission</Nav.Link>
                        <Nav.Link>managers</Nav.Link>
                        <Nav.Link>developers</Nav.Link>
                    </Nav>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav>
                        <Nav.Link>user profile</Nav.Link>
                            <Nav.Link>
                                {!isConnected &&
                                    <div>
                                        <Button variant="primary" onClick={connectClick}>Connect to MetaMask</Button>
                                    </div>
                                }
                                {isConnected && <Badge bg="secondary">
                                    <div className="navbar-badge">
                                        <Jazzicon
                                            diameter={24}
                                            seed={jazzIconInt}
                                        />
                                        &nbsp;
                                        &nbsp;
                                        &nbsp;
                                        <span>{displayAddress}</span>
                                        &nbsp;
                                        &nbsp;
                                        &nbsp;
                                        <Badge>{balance} eth</Badge>
                                    </div>
                                </Badge>}
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

        </div>
    );
}

export default NavBar;


