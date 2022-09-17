import { useState } from 'react';
import ProposalListItem from './proposal_list_item';

export default function ProposalList() {

    const [proposalItems, setProposalItems] = useState([
        '0xa6f36E5ceAF322650F9f83FD6206Da78015fDBDfa',
        '0xb6f36E5cdAF322650F9f83FD6206Da78015fDBDfb',
        '0xc6f36E5ccAF322650F9f83FD6206Da78015fDBDfc',
        '0xd6f36E5cbF3226250F9f83FD6206Da78015fDBDfd',
        '0xe6f36E5caF3226530F9f83FD6206Da78015fDBDfe',
    ])

    return (
        <div className="padd">
            <ul>
                {
                    proposalItems.map((item, key) => (
                        <li key={key}>
                            <ProposalListItem id={item} href="/proposal" value={item} />
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}