import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [messageText, setMessageText] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMessages();
    fetchCounselors();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/messages"
      );
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCounselors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/counselors"
      );
      setCounselors(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    if (!selectedCounselor || !messageText) return;

    await axios.post("http://localhost:5000/api/messages", {
      senderId: user._id,
      receiverId: selectedCounselor._id,
      content: messageText,
    });

    setMessageText("");
    fetchMessages();
  };

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-1">Messages</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Stay connected with your counselor
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inbox */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 bg-white rounded-2xl shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Inbox</h2>
          </div>

          <div>
            {messages.length === 0 ? (
              <p className="p-5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                No messages yet.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-5 border-b hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {msg.content}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4">
            Available Counselors
          </h2>

          {counselors.map((c) => (
            <div key={c._id} className="mb-4 border-b pb-2">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {c.specialization}
              </p>

              <button
                onClick={() => setSelectedCounselor(c)}
                className="mt-2 bg-teal-500 text-white px-3 py-1 rounded"
              >
                Select
              </button>
            </div>
          ))}

          {selectedCounselor && (
            <div className="mt-4">
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) =>
                  setMessageText(e.target.value)
                }
              />

              <button
                onClick={sendMessage}
                className="w-full bg-teal-500 text-white py-2 rounded mt-2"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
