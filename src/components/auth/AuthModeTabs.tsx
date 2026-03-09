export function AuthModeTabs({ mode, onChange }: { mode: 'password' | 'otp'; onChange: (m: 'password' | 'otp') => void }) {
  return (
    <div className="mt-4 inline-flex rounded-full bg-white/10 p-1 text-xs">
      <button className={`rounded-full px-3 py-1 ${mode === 'otp' ? 'bg-white/20' : ''}`} onClick={() => onChange('otp')}>Email + OTP</button>
      <button className={`rounded-full px-3 py-1 ${mode === 'password' ? 'bg-white/20' : ''}`} onClick={() => onChange('password')}>Email + Password</button>
    </div>
  );
}
