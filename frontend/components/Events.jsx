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
  PlayerPlayedGame: {
    text: "PlayerPlayedGame",
    className: "bg-blue-400",
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
    <>
      <h2 className="text-4xl font-extrabold mt-4">Events</h2>
      <Table className="mt-4">
        <TableCaption>List of the different events</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2 items-center justify-center">
              Type
            </TableHead>
            <TableHead>Args</TableHead>
            <TableHead>Block Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const eventType = eventTypes[event.type] || eventTypes.default;
            return (
              <TableRow key={crypto.randomUUID()}>
                <TableCell className="font-medium">
                  <Badge className={eventType.className}>
                    {eventType.text}
                  </Badge>
                </TableCell>
                <TableCell>{JSON.stringify(event.args)}</TableCell>
                <TableCell>{event.blockNumber}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default Events;
