import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <div className="flex justify-between items-center w-full p-2 bg-[#706C61]">
      <div>
        <img src="NADCASINO.png" alt="logo" width="150px" />
      </div>
      <div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
