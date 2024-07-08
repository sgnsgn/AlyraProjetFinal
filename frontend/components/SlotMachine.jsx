import React, { useState, useEffect } from "react";
import "./SlotMachine.css";

const motifs = ["🍒", "🔔", "🍋"];

const getRandomNumber = () => Math.floor(Math.random() * 9);

const getRandomSymbolExcept = (except) => {
  const filteredMotifs = motifs.filter((motif) => motif !== except);
  return filteredMotifs[Math.floor(Math.random() * filteredMotifs.length)];
};

const SlotMachine = () => {
  const [reel1, setReel1] = useState("🍒");
  const [reel2, setReel2] = useState("🔔");
  const [reel3, setReel3] = useState("🍋");
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const spinReels = () => {
    setSpinning(true);
    setWinning(false);
    setResultMessage("");

    setTimeout(() => {
      const result = getRandomNumber();
      const isWinningNumber = result === 0;
      const winningSymbol = motifs[Math.floor(Math.random() * motifs.length)];

      if (isWinningNumber) {
        setReel1(winningSymbol);
        setReel2(winningSymbol);
        setReel3(winningSymbol);
        setWinning(true);
        setResultMessage(
          `Winning result: ${result}, Symbols: ${winningSymbol}-${winningSymbol}-${winningSymbol}`
        );
      } else {
        const firstSymbol = motifs[Math.floor(Math.random() * motifs.length)];
        const secondSymbol = getRandomSymbolExcept(firstSymbol);
        const thirdSymbol = getRandomSymbolExcept(firstSymbol);
        setReel1(firstSymbol);
        setReel2(secondSymbol);
        setReel3(thirdSymbol);
        setResultMessage(
          `Losing result: ${result}, Symbols: ${firstSymbol}-${secondSymbol}-${thirdSymbol}`
        );
      }

      setSpinning(false);
    }, 3000); // Durée de l'animation avant de s'arrêter
  };

  useEffect(() => {
    let interval;
    if (spinning) {
      interval = setInterval(() => {
        setReel1(motifs[Math.floor(Math.random() * motifs.length)]);
        setReel2(motifs[Math.floor(Math.random() * motifs.length)]);
        setReel3(motifs[Math.floor(Math.random() * motifs.length)]);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [spinning]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <div className="text-2xl mb-4"></div>
      <div className="slot-machine">
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel1}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel2}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel3}</div>
      </div>
      <br />
      <button onClick={spinReels} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </button>
      <div style={{ marginTop: "20px", fontSize: "1.2em" }}>
        {resultMessage}
      </div>
      {winning && <div>Congratulations! You won!</div>}
    </div>
  );
};

export default SlotMachine;
