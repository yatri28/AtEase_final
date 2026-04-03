import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SessionPage() {
  const { id } = useParams();

  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    const sessionTime = new Date(localStorage.getItem(`session-${id}`));

    const interval = setInterval(() => {
      const now = new Date();
      const diff = sessionTime - now;

      if (diff <= 0) {
        setSessionStarted(true);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="p-6 text-center">
      {!sessionStarted ? (
        <>
          <h2 className="text-xl font-bold">Session starts in:</h2>
          <p className="text-2xl mt-2">{timeLeft}s</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-green-500">
            Session Started 🎉
          </h2>
          <p>Connect with counselor here...</p>
        </>
      )}
    </div>
  );
}