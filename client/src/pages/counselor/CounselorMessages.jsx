import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

// --- HELPER: Grouping Logic ---
const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

export default function CounselorMessages() {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/counselor-inbox/${user._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [user._id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleBookmark = async (e, id) => {
    e.stopPropagation();
    await axios.patch(`http://localhost:5000/api/messages/${id}/bookmark?role=counselor`);
    fetchMessages();
  };

  const deleteMsg = async (e, id) => {
    e.stopPropagation();
    if(!window.confirm("Delete for you?")) return;
    await axios.delete(`http://localhost:5000/api/messages/${id}?role=counselor`);
    fetchMessages();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/messages", {
        senderId: user._id,
        receiverId: selectedStudent._id,
        content: replyText,
      });
      setReplyText("");
      setSelectedStudent(null);
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  // --- LOGIC: Filter by Tab vs Bookmarks ---
  const incoming = messages.filter(m => m.receiverId?._id === user._id);
  const sent = messages.filter(m => m.senderId?._id === user._id);

  let currentMessages;
  if (showOnlyBookmarked) {
    // CORRECTED: Using counselor-specific bookmark flag
    currentMessages = messages.filter(m => m.isBookmarkedByCounselor);
  } else {
    currentMessages = activeTab === 'inbox' ? incoming : sent;
  }

  const groupedData = groupMessagesByDate(currentMessages);

  return (
    <DashboardLayout role="counselor">
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        
        {/* --- TOP NAV --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Guidance Portal</p>
          </div>

          <div className="flex items-center gap-3">
            {/* BOOKMARK TOGGLE */}
            <button 
                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-tighter ${
                    showOnlyBookmarked 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
            >
                <span className="text-base">{showOnlyBookmarked ? '★' : '☆'}</span>
                {showOnlyBookmarked ? 'Starred' : 'See Starred'}
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                <TabBtn 
                  active={!showOnlyBookmarked && activeTab === 'inbox'} 
                  isStarredMode={showOnlyBookmarked} // ADDED
                  onClick={() => {setActiveTab('inbox'); setShowOnlyBookmarked(false);}} 
                  label="Incoming" 
                  count={incoming.length} 
                />
                <TabBtn 
                  active={!showOnlyBookmarked && activeTab === 'sent'} 
                  isStarredMode={showOnlyBookmarked} // ADDED
                  onClick={() => {setActiveTab('sent'); setShowOnlyBookmarked(false);}} 
                  label="Outbox" 
                  count={sent.length} 
                />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* --- LEFT: SCROLLABLE LIST --- */}
          <div className="col-span-12 lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {Object.entries(groupedData).map(([dateLabel, msgs]) => (
                <div key={dateLabel}>
                  <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-2 border-y border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{dateLabel}</span>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {msgs.map(msg => (
                      <MessageRow 
                        key={msg._id} 
                        msg={msg} 
                        currentUserId={user._id}
                        active={selectedStudent?._messageId === msg._id}
                        onSelect={(student) => setSelectedStudent({ 
                          ...student, 
                          _messageId: msg._id, 
                          _msgContent: msg.content,
                          _timestamp: msg.createdAt 
                        })}
                        onBookmark={toggleBookmark}
                        onDelete={deleteMsg}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {currentMessages.length === 0 && <EmptyView label={showOnlyBookmarked ? "No starred messages" : "No communications found"} />}
            </div>
          </div>

          {/* --- RIGHT: DATA PANEL --- */}
          <div className="hidden lg:col-span-5 lg:flex flex-col min-h-0">
            {selectedStudent ? (
              <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl flex flex-col h-full border border-slate-800 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em]">Student Records</span>
                    <h2 className="text-3xl font-bold text-white mt-1">{selectedStudent.name}</h2>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
                    {selectedStudent.name.charAt(0)}
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Interacted: {new Date(selectedStudent._timestamp).toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  
                  <DataTile label="Year" value={`${selectedStudent.year} Year`} />
                  <DataTile label="Department" value={selectedStudent.department} />
                  <DataTile label="Email Address" value={selectedStudent.email} isEmail />
                </div>

                <div className="flex-1 flex flex-col bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <label className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">
                    {messages.find(m => m._id === selectedStudent._messageId)?.senderId?._id === user._id ? "Sent Guidance" : "New Response"}
                  </label>
                  
                  {messages.find(m => m._id === selectedStudent._messageId)?.senderId?._id !== user._id ? (
                    <>
                      <textarea 
                        className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-600 resize-none outline-none text-sm leading-relaxed"
                        placeholder="Type your professional guidance..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button onClick={handleReply} className="mt-4 w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]">
                        Send Reply
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col h-full">
                        <p className="text-slate-300 text-sm leading-relaxed italic overflow-y-auto flex-1">
                        "{selectedStudent._msgContent}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Secure Communication Logged</span>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="text-4xl mb-4 opacity-10 grayscale">📧</div>
                <p className="text-sm font-bold uppercase tracking-widest mb-2">Workspace Empty</p>
                <p className="text-xs max-w-[200px] leading-relaxed">Select a communication to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- SHARED UI COMPONENTS ---

const TabBtn = ({ active, onClick, label, count, isStarredMode }) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 
    ${active 
        ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white scale-105' 
        : isStarredMode 
          ? 'text-amber-500 font-bold' // Yellow text when Starred is active
          : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label} 
    <span className={`px-2 py-0.5 rounded-md text-[9px] 
      ${active 
        ? 'bg-teal-500 text-white' 
        : isStarredMode 
          ? 'bg-amber-100 text-amber-600' // Yellow count badge
          : 'bg-slate-200 dark:bg-slate-900 text-slate-500'}`}
    >
      {count}
    </span>
  </button>
);

const DataTile = ({ label, value, isEmail }) => (
  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
    <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter mb-1">{label}</p>
    <p className={`text-slate-200 font-bold truncate ${isEmail ? 'text-[10px]' : 'text-xs'}`}>{value}</p>
  </div>
);

const MessageRow = ({ msg, onSelect, onBookmark, onDelete, active, currentUserId }) => {
  const isSentByMe = msg.senderId?._id === currentUserId;
  const target = isSentByMe ? msg.receiverId : msg.senderId;
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => onSelect(target)}
      className={`group p-6 cursor-pointer transition-all relative ${active ? 'bg-teal-50/40 dark:bg-teal-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" />}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`font-black text-xs uppercase tracking-tight ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {isSentByMe ? "TO: " : "FROM: "} {target?.name}
            </span>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">
              {target?.year} Year 
            </span>
            <span className="text-[9px] text-slate-400 font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">
              {time}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-8 leading-relaxed font-medium">
            {msg.content}
          </p>
        </div>
        
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* CORRECTED: Checking counselor flag here */}
          <button onClick={(e) => onBookmark(e, msg._id)} className={`${msg.isBookmarkedByCounselor ? 'text-amber-500' : 'text-slate-300'} hover:scale-125 transition-transform`}>
            {msg.isBookmarkedByCounselor ? '★' : '☆'}
          </button>
          <button onClick={(e) => onDelete(e, msg._id)} className="text-slate-300 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyView = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{label}</p>
  </div>
);