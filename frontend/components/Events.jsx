import React, { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 15;

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const currentEvents = events.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

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
          {currentEvents.map((event) => {
            const eventType = eventTypes[event.type] || eventTypes.default;
            const args = event.args;
            const playerAddress = args.player || JSON.stringify(args);
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
      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Events;
