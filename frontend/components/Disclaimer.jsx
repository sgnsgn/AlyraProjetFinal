import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Disclaimer = ({ onAccept }) => {
  return (
    <AlertDialog open>
      <AlertDialogTrigger asChild>
        <button style={{ display: "none" }}>Open</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center items-center justify-center">
          <AlertDialogTitle className="text-2xl font-bold text-center mb-4">
            Disclaimer
          </AlertDialogTitle>
          <AlertDialogDescription className="mb-4">
            <p>You must be of legal age old to gamble.</p>
            <p>Gambling can be addictive. Please play responsibly.</p>
            <p>
              Gambling is a form of entertainment. Set a budget and stick to it.
            </p>
            <p>Bet with your head, not over it.</p>
            <p>
              The odds of winning gambling games are not in your favor. Not all
              games are created equal. Some games offer better odds than others.
            </p>
            <p className="text-1xl mt-4 font-bold">Restricted Territories:</p>
            <p>
              If you live in the following restricted territories, you are not
              allowed to play on this platform:
            </p>
            <p className="font-bold text-red-500">
              USA, Turkey, Aruba, Bonaire, Curacao, France, Netherlands, Sweden,
              Israel, Lithuania, Slovakia, Belgium, Switzerland, Saba, St
              Eustatius, St Martin, China, United Kingdoms.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="text-center items-center justify-center">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>
            I am allowed to play and have read the warning
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Disclaimer;
