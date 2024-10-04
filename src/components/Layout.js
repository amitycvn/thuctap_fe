// components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SessionDisplay from './SessionDisplay';

const Layout = () => {
    return (
        <div className="layout">
            <SessionDisplay />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
