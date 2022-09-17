import { Link } from "react-router-dom"


const ProposalListItem = ({id, value, href}) => {
    return (
        <Link to={`${href}/${id}`}>{value}</Link>
    )
}

export default ProposalListItem;