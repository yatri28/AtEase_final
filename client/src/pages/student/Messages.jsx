import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?._id) {
      fetchMessages();
      fetchCounselors();
    }
  }, []);

  // Fetch all messages of logged-in student
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/student/${user._id}`
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
    if (!selectedCounselor || !messageText.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        {
          senderId: user._id,
          receiverId: selectedCounselor._id,
          content: messageText,
        }
      );

      // Add new message instantly
      setMessages((prev) => [res.data, ...prev]);

      setMessageText("");
      setSuccess("Message sent successfully!");

      setTimeout(() => setSuccess(""), 3000);

    } catch (error) {
      console.log(error);
    }
  };

  const deleteMessageFrontend = (id) => {
    setMessages((prev) =>
      prev.filter((msg) => msg._id !== id)
    );
  };

  // Inbox = messages received by student
  const incomingMessages = messages.filter(
    (msg) =>
      msg.receiverId?.toString() === user._id.toString()
  );

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-1">Messages</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Stay connected with your counselor
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* INBOX */}
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Inbox</h2>
          </div>

          {incomingMessages.length === 0 ? (
            <p className="p-5 text-gray-500 text-sm">
              No incoming messages.
            </p>
          ) : (
            incomingMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-5 border-b bg-blue-50"
              >
                <p className="font-medium">{msg.content}</p>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}

          {/* HISTORY */}
          <div className="p-5 border-t">
            <h2 className="font-semibold text-lg">
              Message History
            </h2>
          </div>

          {messages.length === 0 ? (
            <p className="p-5 text-gray-500 text-sm">
              No message history.
            </p>
          ) : (
            messages.map((msg) => {
              const counselor = counselors.find(
                (c) =>
                  c._id === msg.receiverId ||
                  c._id === msg.senderId
              );

              const isSent =
                msg.senderId?.toString() ===
                user._id.toString();

              return (
                <div
                  key={msg._id}
                  className="p-5 border-b hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">
                        {isSent ? "Sent to: " : "From: "}
                        <span className="font-medium">
                          {counselor
                            ? counselor.name
                            : "Counselor"}
                        </span>
                      </p>

                      <p className="font-medium mt-1">
                        {msg.content}
                      </p>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          msg.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        deleteMessageFrontend(msg._id)
                      }
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
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
              <p className="text-sm text-gray-600 mb-2">
                Messaging:{" "}
                <span className="font-medium">
                  {selectedCounselor.name}
                </span>
              </p>

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
                disabled={!messageText.trim()}
                className={`w-full py-2 rounded mt-2 ${
                  messageText.trim()
                    ? "bg-teal-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
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