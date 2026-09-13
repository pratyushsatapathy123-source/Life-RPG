const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const oldAccount = `          <section id="account" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Account</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{user?.displayName || 'Adventurer'}</h3>
                  <p className="text-sm text-zinc-500">{user?.email}</p>
                  <p className="text-xs text-zinc-400 mt-1">ID: {user?.uid}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100">
                <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors">
                  Change Password
                </button>
                <button onClick={handleLogout} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </section>`;

const newAccount = `          <section id="account" className="space-y-4">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold text-zinc-900">Account</h2>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-white text-2xl font-bold">
                  {profileForm.name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{profile?.name || 'Adventurer'}</h3>
                  <p className="text-sm text-zinc-500">{user?.email}</p>
                  <p className="text-xs text-zinc-400 mt-1">ID: {user?.uid}</p>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Display Name</label>
                    <input 
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Email</label>
                    <input 
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="w-full p-2.5 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                   <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                   </button>
                   <button type="button" onClick={handleLogout} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </form>
            </div>
          </section>`;

code = code.replace(oldAccount, newAccount);
fs.writeFileSync('src/pages/Settings.tsx', code);
