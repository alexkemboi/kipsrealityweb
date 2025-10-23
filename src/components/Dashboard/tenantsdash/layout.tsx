import React, { ReactNode } from "react";
import SideBarComponent from "../tenantsdash/SideBarContainer";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className='h-screen'>
            <Navbar />
            <div className='w-full xs:flex-col md:w-full md:flex md:justify-between'>
                <div className='w-1/5 md:block bg-[#0f172a]'>
                    <SideBarComponent />
                </div>
                <div className='overflow-y-auto h-full md:align-center md:justify-center w-4/5 m-auto'>
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
