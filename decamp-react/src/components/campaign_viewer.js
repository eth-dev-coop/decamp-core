import React, { useState, useEffect, useRef } from "react";
import Container from 'react-bootstrap/Container';
import Web3 from 'web3';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ABI from '../web3/abi.json';
import Form from 'react-bootstrap/Form';
import Badge from "react-bootstrap/Badge";
import { useParams, useNavigate } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import { BsCheck, BsFillHandThumbsDownFill, BsFillHandThumbsUpFill, BsQuestionCircle } from "react-icons/bs";
import Moment from 'react-moment';
import 'moment-timezone';
import InputGroup from 'react-bootstrap/InputGroup';


const CampaignViewer = (props) => {

    const [isConnected, setIsConnected] = useState(false);
    const [didInit, setDidInit] = useState(false);

    const [description, setDescription] = useState("");
    const [balance, setBalance] = useState(0);

    const [contractAddress, setContractAddress] = useState("");
    const [contractAddressDisplay, setContractAddressDisplay] = useState("");

    const [leaderAddress, setLeaderAddress] = useState("");
    const [leaderAddressDisplay, setLeaderAddressDisplay] = useState("");

    const [managerAddress, setManagerAddress] = useState("");
    const [managerAddressDisplay, setManagerAddressDisplay] = useState("");

    const [managerLimit, setManagerLimit] = useState("");
    const [managerPoints, setManagerPoints] = useState("");
    const [managerDescription, setManagerDiscription] = useState("");

    const [creatorAddressDisplay, setCreatorAddressDisplay] = useState("");
    const [creator, setCreator] = useState("");

    const [enteredBalance, setEnteredBalance] = useState("");

    const [isCreator, setIsCreator] = useState(false);
    const [isHalted, setIsHalted] = useState(false);
    const [isFunded, setIsFunded] = useState(false);
    const [isPastBufferDate, setIsPastBufferDate] = useState(false);
    const [isContributor, setIsContributor] = useState(false);
    const [isCommitButtonDisabled, setIsCommitButonDisabled] = useState(true);
    const [isExistingManager, setIsExistingManager] = useState("");
    const [isManager, setIsManager] = useState(false);
    const [campaignHasManager, setCampaignHasManager] = useState(false);
    const [didSendProposal, setDidSendProposal] = useState(false);
    const [dateCreated, setDateCreated] = useState("");
    const [dateEligible, setDateEligible] = useState("");

    const [showHaltLoader, setShowHaltLoader] = useState(false);
    const [showWithdrawalLoader, setShowWithdrawalLoader] = useState(false);
    const [showManagerRewardLoader, setShowManagerRewardLoader] = useState(false);
    const [showRefundLoader, setShowRefundLoader] = useState(false);
    const [showBecomeManagerLoader, setShowBecomeManagerLoader] = useState(false);
    const [showSubmitPropLoader, setShowSubmitPropLoader] = useState(false);
    const [showContributeLoader, setShowContributeLoader] = useState(false);
    const [showVoteLoader, setShowVoteLoader] = useState(false);
    const [showAssignToLoader, setShowAssignToLoader] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showPropEditor, setShowPropEditor] = useState(false);

    const [proposals, setProposals] = useState([]);
    const [propEditorSummary, setPropEditorSummary] = useState("");
    const [propEditorLimit, setPropEditorLimit] = useState("");

    const [propStateDisplay, setPropStateDisplay] = useState("");

    const managerPoolContract = useRef(null);
    const campaignContract = useRef(null);
    const web3 = useRef(null);

    const params = useParams();
    const naviate = useNavigate();

    function getShortAccountAddress(address) {
        var firstFour = address.slice(0, 5);
        var lastFour = address.slice(-5);
        return firstFour + "..." + lastFour;
    }

    const init = async () => {
        var campaign = params.id;
        if (!campaign) {
            return;
        }

        web3.current = new Web3(window.ethereum);
        campaignContract.current = new web3.current.eth.Contract(ABI.campaignABI, campaign);

        var creatorResponse = await campaignContract.current.methods.creator().call();
        var descriptionResponse = await campaignContract.current.methods.description().call();
        var stateResponse = await campaignContract.current.methods.campaignState().call();
        var dateResponse = await campaignContract.current.methods.dateCreated().call();
        var eliDateResponse = await campaignContract.current.methods.dateCreated().call();
        var balance = await web3.current.eth.getBalance(campaign);

        switch (parseInt(stateResponse)) {
            case 0: setPropStateDisplay("PROPOSAL");
                break;
            case 1: setPropStateDisplay("MANAGER");
                break;
            case 2:
                setPropStateDisplay("FUNDED");
                setIsFunded(true);
                break;
            case 3:
                setPropStateDisplay("HALTED");
                setIsHalted(true);
                break;
        }


        setCreatorAddressDisplay(getShortAccountAddress(creatorResponse))
        setCreator(creatorResponse);
        setDateCreated(dateResponse);
        setDateEligible(eliDateResponse);


        setDescription(descriptionResponse);
        setBalance(balance);
        setContractAddress(campaign);
        setContractAddressDisplay(getShortAccountAddress(campaign));

        campaignContract.current.events.CampaignAssigned()
            .on('data', async function (event) {
                window.location.reload();
            })
            .on('error', function (error, receipt) {
                console.log(error);
            });

        campaignContract.current.events.CampaignFunded()
            .on('data', async function (event) {
                window.location.reload();
            })
            .on('error', function (error, receipt) {
                console.log(error);
            });

        managerPoolContract.current = new web3.current.eth.Contract(ABI.managerPoolABI, ABI.managerPoolAccount);

        var hasManager = await campaignContract.current.methods.hasManager().call();
        setCampaignHasManager(hasManager);

        if (!hasManager) {
            await fillProposalArray();
            var hasEligibleVoteCount = await campaignContract.current.methods.leaderIsEligible().call();
            var currentTimeSeconds = Date.now();

            if (hasEligibleVoteCount) {
                var leader = await campaignContract.current.methods.leader().call();
                var amountNeeded = await campaignContract.current.methods.getAmountForManager(leader).call();
                if (currentTimeSeconds > dateEligible) {
                    setIsPastBufferDate(true);
                    if (balance >= amountNeeded) {
                        setIsCommitButonDisabled(false);
                    }
                }
            }


        } else {
            await setCurrentManager();
        }

        const provider = await detectEthereumProvider();

        if (provider && provider.selectedAddress) {
            var isContributorResponse = await campaignContract.current.methods.isContributor(provider.selectedAddress).call();
            setIsContributor(isContributorResponse);
            setIsCreator(creatorResponse.toLowerCase() == window.ethereum.selectedAddress.toLowerCase());
            setIsConnected(true);
            const isManagerResponse = await managerPoolContract.current.methods.isManager(window.ethereum.selectedAddress).call();
            setIsExistingManager(isManagerResponse);
            var managerAddress = await campaignContract.current.methods.manager().call();
            if (managerAddress.toLowerCase() == window.ethereum.selectedAddress.toLowerCase()) {
                setIsManager(true);
            } else {
                setIsManager(false);
            }

        } else {
            setIsConnected(false);
        }
        setDidInit(true);
    };

    useEffect(() => {
        init();
        window.ethereum.on('accountsChanged', init);
        window.ethereum.on('connect', init);
        return () => {
            window.ethereum.removeListener('accountsChanged', init);
            window.ethereum.removeListener('connect', init);
        };
    }, []);

    function showSuccessHelper() {
        setTimeout(() => { setShowSuccess(false); }, 5000);
        setShowSuccess(true);
    }

    const setCurrentManager = async () => {
        var managerAddressRes = await campaignContract.current.methods.manager().call();
        var amount = await campaignContract.current.methods.getAmountForManager(managerAddressRes).call();
        var points = await managerPoolContract.current.methods.getManagerPoints(managerAddressRes).call();
        var description = await campaignContract.current.methods.getProposalManagerByAddress(managerAddressRes).call();
        setManagerPoints(points);
        setManagerDiscription(description);
        setManagerLimit(amount);
        setManagerAddress(managerAddressRes);
        setManagerAddressDisplay(getShortAccountAddress(managerAddressRes));
    };

    const fillProposalArray = async () => {
        var proposalResponse = await campaignContract.current.methods.getProposals().call();
        var proposalsNewInstance = [];
        for (var i = 0; i < proposalResponse.length; i++) {
            if (proposalResponse[i].toLowerCase() == window.ethereum.selectedAddress) {
                setDidSendProposal(true);
            }
            var votes = await campaignContract.current.methods.getVotesForManager(proposalResponse[i]).call();
            var amount = await campaignContract.current.methods.getAmountForManager(proposalResponse[i]).call();
            var points = await managerPoolContract.current.methods.getManagerPoints(proposalResponse[i]).call();
            var description = await campaignContract.current.methods.getProposalManagerByAddress(proposalResponse[i]).call();

            proposalsNewInstance.push({
                votes,
                amount,
                manager: proposalResponse[i],
                points,
                description
            });
        }
        setProposals(proposalsNewInstance);
    };


    const closeViewer = () => {
        naviate("/");
    };

    const onContributeClick = async (e) => {
        if (!isNaN(enteredBalance) && enteredBalance > 0 && enteredBalance < 100) {
            setShowContributeLoader(true);
            var gewiFloat = (parseFloat(enteredBalance) * 1000000000000000000);
            var gewi = parseInt(gewiFloat);
            await campaignContract.current.methods.contribute().send({
                value: gewi,
                from: window.ethereum.selectedAddress
            });
            setBalance(await web3.current.eth.getBalance(contractAddress));
            setShowContributeLoader(false);
            setIsContributor(true);
            setEnteredBalance(0);
            showSuccessHelper();
        }
    };

    const becomeManagerClick = async (e) => {
        setShowBecomeManagerLoader(true);
        await managerPoolContract.current.methods.createManager().send({
            from: window.ethereum.selectedAddress
        });
        const isManagerResponse = await managerPoolContract.current.methods.isManager(window.ethereum.selectedAddress).call();
        setIsExistingManager(isManagerResponse);
        setDidSendProposal(false);
        setShowBecomeManagerLoader(false);
        showSuccessHelper();
    };

    const submitProposalClick = () => {
        setShowPropEditor(true);
    };

    const onPropVoteClick = async (managerAddress) => {
        setShowVoteLoader(true);
        await campaignContract.current.methods.voteOnProposal(managerAddress).send({
            from: window.ethereum.selectedAddress
        });
        await fillProposalArray();
        setShowVoteLoader(false);
        showSuccessHelper();
    };

    const onEditorSubmit = async (e) => {
        e.preventDefault();
        if (!isNaN(propEditorLimit) && propEditorLimit > 0 && propEditorLimit < 100) {
            if (propEditorSummary.length > 20) {
                setShowSubmitPropLoader(true);
                var finnyFloat = (parseFloat(propEditorLimit) * 1000);
                var finny = parseInt(finnyFloat);
                await campaignContract.current.methods.submitProposal(propEditorSummary, finny).send({
                    from: window.ethereum.selectedAddress
                });
                setShowPropEditor(false);
                await fillProposalArray();
                setDidSendProposal(true);
                setShowSubmitPropLoader(false);
                showSuccessHelper();
            }
        }
    };

    const onEditorCancel = () => {
        setShowPropEditor(false);
        setPropEditorSummary("");
        setPropEditorLimit("");
    };

    const onRefundClick = async (e) => {
        setShowRefundLoader(true);
        await campaignContract.current.methods.refund().send({ from: window.ethereum.selectedAddress });
        setIsContributor(false);
        showSuccessHelper();
        setBalance(await web3.current.eth.getBalance(contractAddress));
        setShowRefundLoader(false);
        showSuccessHelper();
    };

    const punishManager = async () => {
        setShowManagerRewardLoader(true);
        await managerPoolContract.current.methods.punishManager(managerAddress).send({ from: window.ethereum.selectedAddress });
        await setCurrentManager();
        setShowManagerRewardLoader(false);
        showSuccessHelper();
    };

    const rewardManager = async () => {
        setShowManagerRewardLoader(true);
        await managerPoolContract.current.methods.rewardManager(managerAddress).send({ from: window.ethereum.selectedAddress });
        await setCurrentManager();
        setShowManagerRewardLoader(false);
        showSuccessHelper();
    };

    const onAssignToClick = async () => {
        setShowAssignToLoader(true);
        await campaignContract.current.methods.assignCampaign().send({ from: window.ethereum.selectedAddress });
        window.location.reload();
    };

    const onWithdrawalClick = async () => {
        setShowWithdrawalLoader(true);
        await campaignContract.current.methods.withdrawalFunds().send({ from: window.ethereum.selectedAddress });
        setShowWithdrawalLoader(false);
        await init();
        showSuccessHelper();
    };

    const onHaltClick = async () => {
        setShowHaltLoader(true);
        await campaignContract.current.methods.haltCampaign().send({ from: window.ethereum.selectedAddress });
        await init();
        setShowHaltLoader(false);
    };

    const getEtherscanHref = (id) => {
        return "https://rinkeby.etherscan.io/address/" + id;
    };

    const existingProposals = proposals.map((proposal) => {
        return (
            <div key={proposal.manager}>
                <Row className="proposal-row">
                    <Col md="1">
                        <Badge><span className="navbar-badge">{proposal.votes}</span></Badge>
                    </Col>
                    {isConnected && <Col md="1">
                        {!showVoteLoader &&
                            <Button onClick={(e) => { onPropVoteClick(proposal.manager) }} variant="warning" className="btn btn-sm">+1</Button>
                        }
                        {showVoteLoader &&
                            <div className="loader"></div>
                        }
                    </Col>}
                    <Col md="1">
                        {proposal.points}
                    </Col>
                    <Col md="1">
                        <span>{(proposal.amount / 1000)}eth</span>
                    </Col>
                    <Col md="4">
                        <a href={getEtherscanHref(proposal.manager)}><img className="ethscan" src="./etherscan-logo-light-circle.png"></img></a>
                        &nbsp;
                        <span><b>{getShortAccountAddress(proposal.manager)}</b></span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="small-text">DESCRIPTION</small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {proposal.description}
                    </Col>
                </Row>
            </div>
        )
    });

    return (
        <div>
            {didInit &&
                <div>
                    <div>
                        <div>
                            <br />
                            {showSuccess && <div><Badge className="success-badge" bg="success"><BsCheck /><b>Complete</b></Badge><br /></div>}
                            <br />
                        </div>
                        <Container className="Campaign-Viewer">
                            <br />
                            {!showPropEditor &&
                                <div>
                                    <Row>
                                        <Col>
                                            <b>PLUG</b>
                                        </Col>
                                        <Col md={{ offset: 11 }}>
                                            <Button
                                                onClick={closeViewer}
                                                className="btn-close active" >
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">BALANCE</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <span className="balance-font">{balance / 1000000000000000000} eth</span>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">SMART CONTRACT</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <a target="_blank" href={getEtherscanHref(contractAddress)}><img className="ethscan" src="./etherscan-logo-light-circle.png"></img></a>
                                                    &nbsp;
                                                    <b>{contractAddressDisplay}</b>
                                                </Col>
                                            </Row>

                                        </Col>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">ORIGINAL POSTER</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <a target="_blank" href={getEtherscanHref(creator)}><img className="ethscan" src="./etherscan-logo-light-circle.png"></img></a>
                                                    &nbsp;
                                                    <b>{creatorAddressDisplay}</b>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">DATE CREATED</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Moment unix tz="America/New_York" format="YYYY/MM/DD hh:mm:ss">{dateCreated}</Moment>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">DATE ELIGIBLE</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Moment unix tz="America/New_York" format="YYYY/MM/DD hh:mm:ss">{dateEligible}</Moment>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md="3">
                                            <Row>
                                                <Col>
                                                    <small className="small-text">STATE</small><BsQuestionCircle className="description-icon" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <span>{propStateDisplay}</span>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        {isConnected && !showContributeLoader && !isFunded && !isHalted &&
                                            <Col md="4">
                                                <InputGroup>
                                                    <Form.Control
                                                        size="sm"
                                                        value={enteredBalance}
                                                        onChange={(e) => setEnteredBalance(e.target.value)}
                                                        type="text"
                                                        htmlSize="90px"
                                                        placeholder="0.00000 eth"

                                                    />
                                                    <Button onClick={onContributeClick}>
                                                        Contribute
                                                    </Button>

                                                </InputGroup>
                                            </Col>
                                        }
                                        {showContributeLoader &&
                                            <div className="loader"></div>
                                        }
                                        {isConnected && !isFunded && !showRefundLoader &&
                                            <Col md="3">
                                                <Button variant="success" onClick={onRefundClick} disabled={!isContributor} >
                                                    Refund Me
                                                </Button>
                                                <BsQuestionCircle className="description-icon" />
                                            </Col>
                                        }
                                        {showRefundLoader &&
                                            <div className="loader"></div>
                                        }
                                        {isConnected && !isFunded && !showAssignToLoader &&
                                            <Col md="2">
                                                <Button variant="warning" onClick={onAssignToClick} disabled={isCommitButtonDisabled} >
                                                    Commit
                                                </Button>
                                                <BsQuestionCircle className="description-icon" />
                                            </Col>
                                        }
                                        {showAssignToLoader &&
                                            <div className="loader"></div>
                                        }
                                        <Col>
                                            {(!showBecomeManagerLoader && isConnected && !isExistingManager && !campaignHasManager) &&
                                                <Button
                                                    variant="danger"
                                                    onClick={becomeManagerClick}>
                                                    Join Manager Pool
                                                </Button>
                                            }

                                            {(isExistingManager && !didSendProposal && !campaignHasManager) &&
                                                <div>
                                                    <Button
                                                        variant="warning"
                                                        onClick={submitProposalClick}>
                                                        Submit Proposal
                                                    </Button>
                                                    <BsQuestionCircle className="description-icon" />
                                                </div>
                                            }

                                            {showBecomeManagerLoader &&
                                                <div className="loader">

                                                </div>
                                            }

                                            {!isHalted && (isManager || isCreator) && !isFunded && !showHaltLoader &&
                                                <div>
                                                    <Button
                                                        variant="danger"
                                                        onClick={onHaltClick}>
                                                        Halt
                                                    </Button>
                                                    <BsQuestionCircle className="description-icon" />
                                                </div>
                                            }

                                            {showHaltLoader &&
                                                <div className="loader">

                                                </div>
                                            }
                                        </Col>
                                    </Row>
                                </div>
                            }
                            <br />
                            <br />
                            <Row>
                                <Col>
                                    <small className="small-text">INITIAL DESCRIPTION</small><BsQuestionCircle className="description-icon" />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <p>{description}</p>
                                </Col>
                            </Row>
                            <br />



                            {
                                campaignHasManager &&
                                <div>
                                    <hr />
                                    <Row>
                                        <Col md="2">
                                            <b>MANAGER</b>
                                        </Col>
                                        <Col md="2">
                                            <a target="_blank" href={getEtherscanHref(creator)}><img className="ethscan" src="./etherscan-logo-light-circle.png"></img></a>
                                            &nbsp;
                                            <b>{managerAddressDisplay}</b>
                                        </Col>
                                        {!showManagerRewardLoader &&
                                            <Col md="3">
                                                <Button onClick={rewardManager} variant="success" className="btn btn-sm"><BsFillHandThumbsUpFill /></Button>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <b>{managerPoints}</b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <Button onClick={punishManager} variant="danger" className="btn btn-sm"><BsFillHandThumbsDownFill /></Button>
                                            </Col>
                                        }
                                        {showManagerRewardLoader &&
                                            <div className="loader"></div>
                                        }
                                    </Row>

                                    <Row>
                                        <Col md="2">
                                            <small className="small-text">ETH CAP</small><BsQuestionCircle className="description-icon" />
                                        </Col>
                                        <Col>
                                            <small className="small-text">PROPOSAL</small><BsQuestionCircle className="description-icon" />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="2">
                                            <b>{managerLimit / 1000}</b>
                                        </Col>
                                        <Col>
                                            {managerDescription}
                                        </Col>
                                    </Row>
                                </div>
                            }


                            {isManager && !showWithdrawalLoader && !isFunded &&
                                <div>
                                    <hr />
                                    <Row>
                                        <Col>
                                            <b>MANAGER CONSOLE</b>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Button onClick={onWithdrawalClick} variant="success">Withdrawl Funds</Button>
                                </div>
                            }
                            {showWithdrawalLoader &&
                                <div className="loader">

                                </div>
                            }


                            {showPropEditor && <Row>
                                <Col>
                                    <Form onSubmit={onEditorSubmit}>
                                        <Form.Group className="mb-3" >
                                            <Form.Control
                                                value={propEditorSummary}
                                                onChange={(e) => { setPropEditorSummary(e.target.value) }}
                                                as="textarea"
                                                placeholder="Summary..."
                                                style={{ height: '100px' }}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" >
                                            <Form.Control
                                                value={propEditorLimit}
                                                onChange={(e) => setPropEditorLimit(e.target.value)}
                                                type="text"
                                                placeholder="Minimum ETH"
                                            />
                                        </Form.Group>
                                        <Row>
                                            <Col md={{ span: 1, offset: 9 }}>
                                                {!showSubmitPropLoader &&
                                                    <Button variant="primary" type="submit">
                                                        Submit
                                                    </Button>
                                                }

                                                {showSubmitPropLoader &&
                                                    <div className="loader"></div>
                                                }

                                            </Col>
                                            <Col>
                                                {!showSubmitPropLoader &&
                                                    <Button onClick={onEditorCancel} variant="warning">
                                                        Cancel
                                                    </Button>
                                                }
                                            </Col>
                                        </Row>
                                    </Form>

                                </Col>
                            </Row>}

                            {!campaignHasManager && !showPropEditor &&
                                <div>
                                    <br />
                                    <br />
                                    <Row>
                                        <Col>
                                            <b>PROPOSALS</b>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col md="1">
                                            <small className="small-text">VOTES</small>
                                        </Col>
                                        <Col md="1">
                                            <small className="small-text">VOTE</small>
                                        </Col>
                                        <Col md="1">
                                            <small className="small-text">REP</small>
                                        </Col>
                                        <Col md="1">
                                            <small className="small-text">NEED</small>
                                        </Col>
                                        <Col md="4">
                                            <small className="small-text">ADDRESS</small>
                                        </Col>

                                    </Row>
                                    {existingProposals}
                                    <br />
                                    <br />
                                </div>}
                        </Container >
                        <br />
                        <Container className="Campaign-Viewer">
                            <br />
                            <Row>
                                <Col>

                                </Col>
                            </Row>
                        </Container>
                    </div >
                </div >
            }

            {
                !didInit &&
                <div className="loader">

                </div>
            }
        </div >
    )

};

export default CampaignViewer;