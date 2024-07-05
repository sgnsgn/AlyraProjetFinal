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
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center mb-4">
            Disclaimer
          </AlertDialogTitle>
          <AlertDialogDescription className="mb-4">
            <p>You must be of legal age old to gamble.</p>
            <p>Gambling can be addictive. Please play responsibly.</p>
            <p>
              Gambling is a form of entertainment. Set a budget and stick to it.
            </p>
            <p>
              Gambling may be illegal in your jurisdiction. Please check your
              local laws before gambling.
            </p>
            <p>Bet with your head, not over it.</p>
            <p>
              The odds of winning gambling games are not in your favor. Not all
              games are created equal. Some games offer better odds than others.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>
            I have read and accept the terms
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Disclaimer;
