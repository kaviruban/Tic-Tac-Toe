import React, { useState } from "react";

export const OnBoarding = () => {
  const [playerOneName, setPlayerOneName] = useState<string>("");
  const [playerTwoName, setPlayerTwoName] = useState<string>("");

  return (
    <div className="on-boarding-container">
      <div className="player-details-container">
        <p className="player-text">Player 1 :</p>
        <input
          type="text"
          className="player-input-container"
          placeholder="Enter Player One Name"
          value={playerOneName}
          onChange={(e) => setPlayerOneName(e.target.value)}
        />
      </div>
      <div className="player-details-container">
        <p className="player-text">Player 2 :</p>
        <input
          type="text"
          className="player-input-container"
          placeholder="Enter Player Two Name"
          value={playerTwoName}
          onChange={(e) => setPlayerTwoName(e.target.value)}
        />
      </div>

      <div className="save-button-container">
        <p className="player-text">Save</p>
      </div>
    </div>
  );
};
