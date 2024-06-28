import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-[#2A2B2A]">
      <Header />
      <div className="grow p-8">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
