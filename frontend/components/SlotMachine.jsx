import React, { useState, useEffect } from "react";
import "./SlotMachine.css";

const motifs = ["🍒", "🔔", "🍋"];

const getRandomNumber = () => Math.floor(Math.random() * 9);

const SlotMachine = () => {
  const [reel1, setReel1] = useState("🍒");
  const [reel2, setReel2] = useState("🔔");
  const [reel3, setReel3] = useState("🍋");
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);

  const spinReels = () => {
    setSpinning(true);
    setWinning(false);

    setTimeout(() => {
      const result = getRandomNumber();
      const isWinningNumber = result === 0;
      const winningSymbol = motifs[Math.floor(Math.random() * motifs.length)];

      if (isWinningNumber) {
        setReel1(winningSymbol);
        setReel2(winningSymbol);
        setReel3(winningSymbol);
        setWinning(true);
        console.log(
          `Résultat gagnant: ${result}, Symboles: ${winningSymbol}-${winningSymbol}-${winningSymbol}`
        );
      } else {
        let randomSymbols = [];
        do {
          randomSymbols = [
            motifs[Math.floor(Math.random() * motifs.length)],
            motifs[Math.floor(Math.random() * motifs.length)],
            motifs[Math.floor(Math.random() * motifs.length)],
          ];
        } while (
          randomSymbols[0] === randomSymbols[1] &&
          randomSymbols[1] === randomSymbols[2]
        );

        setReel1(randomSymbols[0]);
        setReel2(randomSymbols[1]);
        setReel3(randomSymbols[2]);
        console.log(
          `Résultat perdant: ${result}, Symboles: ${randomSymbols[0]}-${randomSymbols[1]}-${randomSymbols[2]}`
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
      <div className="slot-machine">
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel1}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel2}</div>
        <div className={`reel ${spinning ? "spinning" : ""}`}>{reel3}</div>
      </div>
      <br />
      <button onClick={spinReels} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {winning && <div>Congratulations! You won!</div>}
      <div>
        {`Résultat perdant: ${result}, Symboles: ${randomSymbols[0]}-${randomSymbols[1]}-${randomSymbols[2]}`}
      </div>
    </div>
  );
};

export default SlotMachine;
