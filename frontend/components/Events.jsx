import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const eventTypes = {
  PlayerBoughtTokens: {
    text: "PlayerBoughtTokens",
    className: "bg-yellow-400",
  },
  RandomWordsRequested: {
    text: "RandomWordsRequested",
    className: "bg-blue-400",
  },
  PlayerPlayedGame: {
    text: "PlayerPlayedGame",
    className: "bg-emerald-400",
  },
  PlayerWon: {
    text: "PlayerWon",
    className: "bg-green-400",
  },
  PlayerLost: {
    text: "PlayerLost",
    className: "bg-red-400",
  },
  PlayerWithdrewTokens: {
    text: "PlayerWithdrewTokens",
    className: "bg-orange-400",
  },
  PlayerGetBackEthers: {
    text: "PlayerGetBackEthers",
    className: "bg-purple-400",
  },
  PlayerBecameInactive: {
    text: "PlayerBecameInactive",
    className: "bg-pink-400",
  },
};

const Events = ({ events }) => {
  return (
    <div className="text-center items-center mx-auto border border-purple-300 rounded-xl bg-black">
      <h2 className="text-4xl font-extrabold mt-4">Events</h2>
      <Table className="mt-4 mx-auto">
        <TableCaption>List of the different events</TableCaption>
        <TableHeader>
          <TableRow className="text-center">
            <TableHead className="w-1/3 text-center">Type</TableHead>
            <TableHead className="w-1/3 text-center">Address</TableHead>
            <TableHead className="w-1/3 text-center">Block Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const eventType = eventTypes[event.type] || eventTypes.default;
            const args = event.args;
            const playerAddress = args.player || JSON.stringify(args); // Extract the player address or show the full args if player is not available
            return (
              <TableRow key={crypto.randomUUID()} className="text-center">
                <TableCell className="font-medium text-center">
                  <Badge className={eventType.className}>
                    {eventType.text}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{playerAddress}</TableCell>
                <TableCell className="text-center">
                  {event.blockNumber}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default Events;
