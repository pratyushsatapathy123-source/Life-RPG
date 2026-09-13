const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const pwdLogic = `  const handleResetPassword = async () => {
    if (!user || !user.email) return;
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, user.email);
      showToast('Password reset email sent!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset email', 'error');
    }
  };
`;

code = code.replace(
  "const handleDeleteAccount = async () => {",
  pwdLogic + "\n  const handleDeleteAccount = async () => {"
);

const pwdBtn = `
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-zinc-900">Change Password</h3>
                  <p className="text-sm text-zinc-500">Send a secure password reset link to your email.</p>
                </div>
                <button onClick={handleResetPassword} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition-colors">
                  Reset Password
                </button>
              </div>
`;

code = code.replace(
  /export my data/i, // Wait, need a reliable replacement point
  "Export My Data"
);

code = code.replace(
  /<div className="flex items-center justify-between pb-4 border-b border-zinc-100">\s*<div>\s*<h3 className="font-semibold text-zinc-900">Active Sessions<\/h3>/,
  pwdBtn + "\n              <div className=\"flex items-center justify-between pb-4 border-b border-zinc-100\">\n                <div>\n                  <h3 className=\"font-semibold text-zinc-900\">Active Sessions</h3>"
);

fs.writeFileSync('src/pages/Settings.tsx', code);
