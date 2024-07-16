import React, { useState, useEffect } from "react";
import "../app/SlotMachine.css";

const motifs = ["🌕", "💰", "🪙", "📈", "🎰"];

const getRandomSymbolExcept = (except) => {
  const filteredMotifs = motifs.filter((motif) => motif !== except);
  return filteredMotifs[Math.floor(Math.random() * filteredMotifs.length)];
};

const SlotMachine2 = ({ spinning, result }) => {
  const [reel1, setReel1] = useState(motifs[0]);
  const [reel2, setReel2] = useState(motifs[1]);
  const [reel3, setReel3] = useState(motifs[2]);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    let interval;
    if (spinning) {
      interval = setInterval(() => {
        setReel1(motifs[Math.floor(Math.random() * motifs.length)]);
        setReel2(motifs[Math.floor(Math.random() * motifs.length)]);
        setReel3(motifs[Math.floor(Math.random() * motifs.length)]);
      }, 100);
    } else if (result) {
      clearInterval(interval);
      if (result.final) {
        if (result.won) {
          const winningSymbol =
            motifs[Math.floor(Math.random() * motifs.length)];
          setReel1(winningSymbol);
          setReel2(winningSymbol);
          setReel3(winningSymbol);
          setResultMessage("Congratulations! You won!");
        } else {
          const firstSymbol = motifs[Math.floor(Math.random() * motifs.length)];
          const secondSymbol = getRandomSymbolExcept(firstSymbol);
          const thirdSymbol = getRandomSymbolExcept(firstSymbol);
          setReel1(firstSymbol);
          setReel2(secondSymbol);
          setReel3(thirdSymbol);
          setResultMessage("You lose, try again ;)");
        }
      } else {
        // État réinitialisé ou initial
        setReel1(motifs[0]);
        setReel2(motifs[1]);
        setReel3(motifs[2]);
        setResultMessage("");
      }
    }
    return () => clearInterval(interval);
  }, [spinning, result]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <div className="text-2xl mb-4"></div>
      <div className="slot-machine">
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel1}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel2}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel3}</div>
      </div>
      <div style={{ marginTop: "20px", fontSize: "1.2em" }}>
        {resultMessage}
      </div>
    </div>
  );
};

export default SlotMachine2;
