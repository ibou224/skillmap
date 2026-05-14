export default function ScoreBar({ score }) {
  return <div className="score-bar" style={{ width: `${score}%` }}></div>;
}
