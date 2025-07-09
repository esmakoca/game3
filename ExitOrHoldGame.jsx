
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const sampleRounds = [
  { baseScore: 87, context: "CFO change, delayed audit", truth: "fraud" },
  { baseScore: 74, context: "No red flags, past false alert", truth: "clean" },
  { baseScore: 91, context: "Sudden executive exit", truth: "fraud" },
  { baseScore: 66, context: "Improved Q2 performance", truth: "clean" },
  { baseScore: 82, context: "Anonymous whistleblower claim", truth: "fraud" },
];

function getRandomizedScore(baseScore) {
  const margin = Math.floor(Math.random() * 11); // ±0–10
  const direction = Math.random() > 0.5 ? 1 : -1;
  return { score: baseScore + direction * margin, band: margin };
}

export default function ExitOrHoldGame() {
  const [round, setRound] = useState(0);
  const [decision, setDecision] = useState(null);
  const [results, setResults] = useState([]);
  const [credits, setCredits] = useState(3);
  const [revealed, setRevealed] = useState(false);

  const currentBase = sampleRounds[round];
  const randomized = getRandomizedScore(currentBase.baseScore);
  const [scoreData] = useState(randomized); // lock it for the round

  const handleDecision = (choice) => {
    let isCorrect = false;

    if (choice === "Escalate") {
      if (credits <= 0) return;
      setCredits(credits - 1);
      setRevealed(true);
      return;
    }

    isCorrect =
      (choice === "Exit" && currentBase.truth === "fraud") ||
      (choice === "Hold" && currentBase.truth === "clean");

    setResults([
      ...results,
      {
        round: round + 1,
        choice,
        truth: currentBase.truth,
        isCorrect,
      },
    ]);

    setDecision(choice);

    setTimeout(() => {
      setDecision(null);
      setRevealed(false);
      if (round < sampleRounds.length - 1) {
        setRound(round + 1);
      }
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="text-xl font-semibold">Round {round + 1}</h2>
          <p><strong>AI Risk Score:</strong> {scoreData.score}/100 (±{scoreData.band})</p>
          <p><strong>Context:</strong> {currentBase.context}</p>
          <p><strong>Effort Credits Left:</strong> {credits}</p>
          <div className="space-x-2 mt-4">
            <Button onClick={() => handleDecision("Exit")} disabled={decision}>Exit</Button>
            <Button onClick={() => handleDecision("Hold")} disabled={decision} variant="outline">Hold</Button>
            <Button onClick={() => handleDecision("Escalate")} disabled={decision || revealed || credits <= 0} variant="secondary">Escalate (-1 credit)</Button>
          </div>
          {revealed && (
            <div className="mt-4 text-sm">
              <p>🔎 Escalation Result: Internal audit shows the company is <strong>{currentBase.truth}</strong>.</p>
              <p>Now make a decision: Exit or Hold.</p>
            </div>
          )}
          {decision && (
            <div className="mt-4">
              <p className="text-sm">
                You chose to <strong>{decision}</strong>. The truth was: <strong>{currentBase.truth}</strong>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length === sampleRounds.length && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">Summary</h2>
            {results.map((res, i) => (
              <p key={i}>
                Round {res.round}: Chose <strong>{res.choice}</strong>, Truth: <strong>{res.truth}</strong> → {res.isCorrect ? "✅ Correct" : "❌ Incorrect"}
              </p>
            ))}
            <div className="mt-4">
              <Progress value={(results.filter(r => r.isCorrect).length / results.length) * 100} />
              <p className="text-sm mt-2">Accuracy: {((results.filter(r => r.isCorrect).length / results.length) * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
