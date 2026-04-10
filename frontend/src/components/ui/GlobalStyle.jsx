const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #08080a;
      --bg1:      #0e0e11;
      --bg2:      #141418;
      --bg3:      #1c1c22;
      --bg4:      #232329;
      --line:     rgba(255,255,255,0.065);
      --line2:    rgba(255,255,255,0.11);
      --text:     #ededef;
      --text2:    #b4b4bc;
      --text3:    #7c7c88;
      --accent:   #818cf8;
      --accent-d: rgba(129,140,248,0.12);
      --accent-b: rgba(129,140,248,0.25);
      --rose:     #f472b6;
      --rose-d:   rgba(244,114,182,0.12);
      --teal:     #2dd4bf;
      --teal-d:   rgba(45,212,191,0.1);
      --amber:    #fbbf24;
      --red:      #f87171;
      --green:    #4ade80;
      --serif:    'Playfair Display', Georgia, serif;
      --sans:     'Plus Jakarta Sans', system-ui, sans-serif;
      --r-sm:     8px;
      --r-md:     12px;
      --r-lg:     18px;
      --r-xl:     24px;
    }

    .light-mode {
      --bg:    #f8f8fb;
      --bg1:   #ffffff;
      --bg2:   #f1f1f5;
      --bg3:   #e8e8ef;
      --bg4:   #dddde8;
      --line:  rgba(0,0,0,0.07);
      --line2: rgba(0,0,0,0.12);
      --text:  #0d0d14;
      --text2: #3a3a50;
      --text3: #7a7a96;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }

    input, textarea {
      font-family: var(--sans);
      background: var(--bg2);
      border: 1px solid var(--line2);
      border-radius: var(--r-md);
      color: var(--text);
      padding: 11px 14px;
      font-size: 14.5px;
      width: 100%;
      outline: none;
      transition: border-color 0.18s, background 0.18s;
    }
    input:focus, textarea:focus {
      border-color: var(--accent);
      background: var(--bg3);
    }
    input::placeholder, textarea::placeholder { color: var(--text3); }
    button { font-family: var(--sans); cursor: pointer; border: none; outline: none; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 0.9; } 50% { opacity: 0.3; } }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
      50%       { box-shadow: 0 0 0 4px rgba(129,140,248,0.18); }
    }
    @keyframes dot-ping {
      0%   { transform: scale(1); opacity: 1; }
      70%  { transform: scale(2.2); opacity: 0; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    .c-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .c-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.28); border-color: var(--accent-b) !important; }

    .b-primary { transition: all 0.15s ease; }
    .b-primary:hover:not(:disabled) { filter: brightness(1.13); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(129,140,248,0.38); }
    .b-primary:active:not(:disabled) { transform: translateY(0); filter: brightness(0.95); }

    .b-ghost { transition: all 0.15s ease; }
    .b-ghost:hover:not(:disabled) { border-color: var(--accent-b) !important; color: var(--text) !important; background: var(--bg3) !important; }
    .b-ghost:active:not(:disabled) { transform: scale(0.98); }

    .b-tab { transition: all 0.15s ease; }
    .b-tab:hover:not([data-active="true"]) { background: var(--bg3) !important; color: var(--text) !important; }

    .b-pill { transition: all 0.15s ease; }
    .b-pill:hover { border-color: var(--accent-b) !important; color: var(--text) !important; background: var(--bg3) !important; }

    .b-src { transition: all 0.18s ease; cursor: pointer; }
    .b-src:hover { border-color: var(--accent) !important; background: var(--accent-d) !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(129,140,248,0.2); }

    .b-danger { transition: all 0.15s ease; }
    .b-danger:hover:not(:disabled) { background: rgba(248,113,113,0.15) !important; border-color: var(--red) !important; color: var(--red) !important; }

    .live-dot { animation: dot-ping 1.8s ease-in-out infinite; }
    .glow-ring { animation: glow-pulse 2.5s ease-in-out infinite; }
    .float { animation: float 3s ease-in-out infinite; }
    .tab-content { animation: fadeUp 0.22s ease both; }
    .slide-down { animation: slideDown 0.2s ease both; }
    .scale-in { animation: scaleIn 0.18s ease both; }

    .src-row { transition: background 0.15s, border-color 0.15s; border-radius: var(--r-md); padding: 6px 8px; margin: 0 -8px; }
    .src-row:hover { background: var(--bg2); }

    .card-glow { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .card-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(129,140,248,0.14), 0 2px 8px rgba(0,0,0,0.2); border-color: var(--accent-b) !important; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-5px); }
    }
    @keyframes live-border {
      0%, 100% { border-color: rgba(45,212,191,0.4); }
      50%      { border-color: rgba(45,212,191,0.9); }
    }
    @keyframes gradient-x {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `}</style>
);

export default GlobalStyle;
