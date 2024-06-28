import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <div className="flex justify-between items-center w-full p-8 bg-[#706C61]">
      <div>Casino&copy;</div>
      <div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
