import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import NavLinkItem from './NavLinkItem';
import MegaMenu from './MegaMenu';

const NavLinks = ({ links, activePath, categories, vertical = false }) => {

    return (
        <ul className={`${vertical ? 'flex flex-col' : 'flex space-x-8'} items-center`}>
            {links.map((link) => {
                return (
                    <NavLinkItem
                        key={link.name}
                        name={link.name}
                        path={link.path}
                        isActive={activePath === link.path}
                        vertical={vertical}
                    />
                );
            })}
        </ul>
    );
};

NavLinks.propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.shape({ name: PropTypes.string.isRequired, path: PropTypes.string.isRequired })
    ).isRequired,
    activePath: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
    vertical: PropTypes.bool,
};

export default NavLinks;
