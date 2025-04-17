import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const NavLinkItem = ({ name, path, isActive, vertical = false }) => (
    <li>
        <NavLink
            to={path}
            className={({ isActive: navIsActive }) =>
                `text-lg font-medium transition px-2 py-1 rounded ${navIsActive || isActive
                    ? 'text-[var(--color-caramel)] bg-[var(--color-caramel)/20]'
                    : 'text-[var(--color-chocolate)] hover:text-[var(--color-caramel)] hover:bg-[var(--color-caramel)/10]'
                } focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]` +
                `${vertical ? ' block' : ''}`
            }
            end
        >
            {name}
        </NavLink>
    </li>
);

NavLinkItem.propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    vertical: PropTypes.bool,
};

export default NavLinkItem;
