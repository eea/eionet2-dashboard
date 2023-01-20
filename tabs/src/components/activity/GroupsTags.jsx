import { React, } from 'react';
import { Chip, Tooltip, } from '@mui/material';


export function GroupsTags({ groups, handleClick, isDialog }) {
    let index = 0;
    const styleClass = isDialog ? 'groups-tags-dialog' : '';
    return (
        <div className={styleClass}>
            <Tooltip title={groups.join(', ') || ''} arrow>
                <div id="groups">
                    {groups.map((m) => (
                        <Chip key={index++} label={m} clickable={!isDialog} onClick={() => handleClick(groups)} />
                    ))}
                </div>
            </Tooltip>
        </div>
    );
}
