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

export default function StudentMessages() {
  const [messages, setMessages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMessages = useCallback(async () => {
    try {
      const url = `http://localhost:5000/api/messages/student/${user._id}${
        showOnlyBookmarked ? '?bookmarked=true' : ''
      }`;
      const res = await axios.get(url);
      setMessages(res.data);
    } catch (error) { console.error("Fetch Error:", error); }
  }, [user._id, showOnlyBookmarked]);

  const fetchCounselors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/counselors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const filtered = res.data.filter(c => 
        c.department === user.department && c.assignedYear === user.year
      );
      setCounselors(filtered);
    } catch (error) { console.error(error); }
  }, [user.department, user.year]);

  useEffect(() => {
    fetchMessages();
    fetchCounselors();
  }, [fetchMessages, fetchCounselors]);

  const sendMessage = async () => {
    if (!selectedThread || !messageText.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/messages", {
        senderId: user._id,
        receiverId: selectedThread._id,
        content: messageText,
      });
      setMessageText("");
      fetchMessages();
    } catch (error) { console.error(error); }
  };

  const toggleBookmark = async (e, id) => {
    e.stopPropagation();
    try {
      // FIX: Added ?role=student to match the backend expectation
      await axios.patch(`http://localhost:5000/api/messages/${id}/bookmark?role=student`);
      
      // Refresh messages to ensure sync with backend flags
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const deleteMsg = async (e, id) => {
    e.stopPropagation();
    if(!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}?role=student`);
      setMessages(prev => prev.filter(m => m._id !== id));
      if(selectedThread?._msgId === id) setSelectedThread(null);
    } catch (err) { console.error(err); }
  };

  const incoming = messages.filter(m => m.receiverId?._id === user._id);
  const sent = messages.filter(m => m.senderId?._id === user._id);
  
  const currentMessages = activeTab === 'inbox' ? incoming : sent;
  const groupedData = groupMessagesByDate(currentMessages);

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h1>
            <p className="text-slate-500 font-medium text-sm italic"> Guidance portal</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-tighter ${
                    showOnlyBookmarked 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
            >
                <span className="text-base">{showOnlyBookmarked ? '★' : '☆'}</span>
                {showOnlyBookmarked ? 'Showing starred' : 'Starred'}
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-200/50">
                {/* COLOR CHANGE LOGIC ADDED HERE */}
              
                <TabBtn 
                    active={!showOnlyBookmarked && activeTab === 'sent'} 
                    isBookmarkActive={showOnlyBookmarked}
                    onClick={() => {setActiveTab('sent'); setShowOnlyBookmarked(false);}} 
                    label="My Inquiries" 
                    count={sent.length} 
                />
                  <TabBtn 
                    active={!showOnlyBookmarked && activeTab === 'inbox'} 
                    isBookmarkActive={showOnlyBookmarked}
                    onClick={() => {setActiveTab('inbox'); setShowOnlyBookmarked(false);}} 
                    label="Responses" 
                    count={incoming.length} 
                />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
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
                        active={selectedThread?._msgId === msg._id}
                        onSelect={(person) => setSelectedThread({ ...person, _msgId: msg._id, _content: msg.content, _date: msg.createdAt })}
                        onBookmark={toggleBookmark}
                        onDelete={deleteMsg}
                        isSentMode={activeTab === 'sent'}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {currentMessages.length === 0 && <EmptyView label={showOnlyBookmarked ? "No bookmarks found" : "No communications yet"} />}
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:flex flex-col min-h-0 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Your Assigned Counselors</h3>
              <div className="flex flex-wrap gap-2">
                {counselors.map(c => (
                  <button 
                    key={c._id} 
                    onClick={() => setSelectedThread({ ...c, isNew: true })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedThread?._id === c._id && selectedThread.isNew ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                  >
                    Dr. {c.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedThread ? (
              <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl flex flex-col h-full border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-900 font-black">
                    {selectedThread.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-none">Prof. {selectedThread.name}</h2>
                    <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mt-1">Counselor Portfolio</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                   <DataTile label="Specialization" value={`Faculty ${selectedThread.role || 'Counselor'}`} />
                   <DataTile label="Member Since" value="July 2024" /> 
                </div>

                <div className="flex-1 flex flex-col bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <label className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">
                    {selectedThread.isNew ? "New Message" : "Message Detail"}
                  </label>
                  
                  {selectedThread.isNew || activeTab === 'sent' ? (
                    <textarea 
                      className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-600 resize-none outline-none text-sm"
                      placeholder="Ask your question or report a concern..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                  ) : (
                    <p className="text-slate-300 text-sm leading-relaxed italic overflow-y-auto">
                      "{selectedThread._content}"
                    </p>
                  )}

                  {selectedThread.isNew && (
                    <button onClick={sendMessage} className="mt-4 w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-black py-4 rounded-2xl transition-all shadow-lg">
                      Send Message
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="text-4xl mb-4 opacity-20">💬</div>
                <p className="text-sm font-bold uppercase tracking-widest">Guidance Room</p>
                <p className="text-xs mt-2">Select a counselor or message to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- SUB-COMPONENTS ---

const TabBtn = ({ active, onClick, label, count, isBookmarkActive }) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 
    ${active 
        ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' 
        : isBookmarkActive 
            ? 'text-amber-500 font-bold' // Yellow when bookmarks are on
            : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label} 
    <span className={`px-2 py-0.5 rounded-md 
        ${active 
            ? 'bg-teal-500 text-white' 
            : isBookmarkActive 
                ? 'bg-amber-100 text-amber-600' // Yellow badge
                : 'bg-slate-200 dark:bg-slate-900 text-slate-500'
        }`}
    >
        {count}
    </span>
  </button>
);

const DataTile = ({ label, value }) => (
  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
    <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter mb-0.5">{label}</p>
    <p className="text-slate-200 font-bold text-xs truncate">{value}</p>
  </div>
);

const MessageRow = ({ msg, onSelect, onBookmark, onDelete, active }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isSentByMe = msg.senderId?._id === user._id;
  const target = isSentByMe ? msg.receiverId : msg.senderId;
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Use student-specific bookmark flag
  const isBookmarked = msg.isBookmarkedByStudent;

  return (
    <div 
      onClick={() => onSelect(target)}
      className={`group p-6 cursor-pointer transition-all relative ${active ? 'bg-teal-50/50 dark:bg-teal-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`font-black text-xs uppercase tracking-tight ${active ? 'text-teal-700 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {isSentByMe ? "TO: " : "FROM: "} Dr. {target?.name}
            </span>
            <span className="text-[9px] text-slate-400 font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
              {time}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-8 leading-relaxed">
            {msg.content}
          </p>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={(e) => onBookmark(e, msg._id)} 
            className={`transition-all hover:scale-125 ${isBookmarked ? 'text-amber-500' : 'text-slate-300'}`}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
          <button onClick={(e) => onDelete(e, msg._id)} className="text-slate-300 hover:text-red-500">
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
    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{label}</p>
  </div>
);