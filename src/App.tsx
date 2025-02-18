import React from 'react';
import { Home, Search, Bell, Mail, User, PlusSquare } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-purple-900 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 p-4 text-white fixed h-full">
        <h1 className="text-2xl font-bold mb-8">SocialHub</h1>
        <div className="space-y-6">
          <NavItem icon={<Home />} text="Home" active />
          <NavItem icon={<Search />} text="Explore" />
          <NavItem icon={<Bell />} text="Notifications" />
          <NavItem icon={<Mail />} text="Messages" />
          <NavItem icon={<User />} text="Profile" />
          <button className="bg-white text-purple-900 w-full rounded-full py-3 font-semibold mt-4 flex items-center justify-center gap-2">
            <PlusSquare size={20} />
            Post
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-white rounded-tl-3xl min-h-screen">
        <div className="max-w-2xl mx-auto pt-6 px-4">
          {/* Create Post */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex gap-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <input
                type="text"
                placeholder="What's on your mind?"
                className="flex-1 bg-white rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Posts */}
          {[1, 2, 3].map((post) => (
            <Post key={post} />
          ))}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, text, active = false }) {
  return (
    <button
      className={`flex items-center gap-4 p-3 rounded-full w-full hover:bg-purple-800 transition-colors ${
        active ? 'font-semibold bg-purple-800' : ''
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function Post() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="font-semibold">Sarah Johnson</h3>
          <p className="text-sm text-gray-500">2 hours ago</p>
        </div>
      </div>
      <p className="mb-4">Just finished my morning hike! The view was absolutely breathtaking! 🏔️</p>
      <img
        src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
        alt="Mountain view"
        className="w-full rounded-xl mb-4"
      />
      <div className="flex gap-4 text-gray-500">
        <button className="flex items-center gap-2 hover:text-purple-600">
          ❤️ 245
        </button>
        <button className="flex items-center gap-2 hover:text-purple-600">
          💬 32
        </button>
        <button className="flex items-center gap-2 hover:text-purple-600">
          🔄 12
        </button>
      </div>
    </div>
  );
}

export default App;