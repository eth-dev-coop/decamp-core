import { useParams } from "react-router-dom"

const ProposalView = () => {

    const { id } = useParams()

   return (
    <div>
        <h1>Proposal View</h1>
        <h5>Received Proposal: {id}</h5>
    </div>
   ) 
}

export default ProposalView;