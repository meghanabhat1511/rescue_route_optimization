import { useState, useEffect, useRef } from "react";

// ── Simulated data ──────────────────────────────────────────────────────────
const TEAMS = [
  { id: "T1", name: "Alpha", lat: 28.612, lng: 77.209, status: "en-route", members: 6, battery: 87 },
  { id: "T2", name: "Bravo", lat: 28.635, lng: 77.225, status: "on-site", members: 4, battery: 54 },
  { id: "T3", name: "Delta", lat: 28.598, lng: 77.198, status: "standby", members: 8, battery: 92 },
  { id: "T4", name: "Echo",  lat: 28.622, lng: 77.241, status: "en-route", members: 5, battery: 31 },
];

const ROUTES = [
  {
    id: "R1", name: "Route Alpha — NH-48 Corridor",
    safetyScore: 94, eta: "12 min", distance: "4.2 km",
    hazards: ["Minor debris at km 2.1"],
    aiNote: "Optimal path. Clear overhead. Recommend.",
    tag: "RECOMMENDED", color: "#0f6e56",
    waypoints: [[28.610, 77.210], [28.618, 77.218], [28.625, 77.230]],
  },
  {
    id: "R2", name: "Route Bravo — Ring Road West",
    safetyScore: 71, eta: "18 min", distance: "6.8 km",
    hazards: ["Flooded underpass", "Low bridge clearance"],
    aiNote: "Avoid if heavy vehicles. Rerouting possible.",
    tag: "ALTERNATE", color: "#ba7517",
    waypoints: [[28.610, 77.210], [28.605, 77.220], [28.615, 77.235]],
  },
  {
    id: "R3", name: "Route Delta — Sector 14 Bypass",
    safetyScore: 43, eta: "26 min", distance: "9.1 km",
    hazards: ["Structural collapse risk", "Gas leak reported", "Crowd blockage"],
    aiNote: "High risk. Only use if others blocked.",
    tag: "HIGH RISK", color: "#a32d2d",
    waypoints: [[28.610, 77.210], [28.600, 77.215], [28.595, 77.230]],
  },
];

const ALERTS = [
  { id: 1, type: "danger",  time: "14:32", msg: "Gas leak confirmed — Sector 9, Block C" },
  { id: 2, type: "warning", time: "14:28", msg: "Bridge load limit exceeded — Route Bravo" },
  { id: 3, type: "info",    time: "14:21", msg: "AI rerouted Alpha Team — saved ~8 min" },
  { id: 4, type: "success", time: "14:15", msg: "Zone 3 evacuation complete — 247 civilians" },
];

// ── Tiny SVG map (simulated) ─────────────────────────────────────────────────
function MiniMap({ teams, routes, selectedRoute }) {
  // Project lat/lng into SVG coords
  const project = (lat, lng) => ({
    x: ((lng - 77.19) / 0.06) * 460 + 20,
    y: ((28.645 - lat) / 0.055) * 280 + 10,
  });

  return (
    <svg viewBox="0 0 500 300" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* Grid */}
      {[0,1,2,3,4].map(i => (
        <line key={`h${i}`} x1="0" y1={i*60+10} x2="500" y2={i*60+10} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      ))}
      {[0,1,2,3,4,5].map(i => (
        <line key={`v${i}`} x1={i*90+20} y1="0" x2={i*90+20} y2="300" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      ))}

      {/* Road network (decorative) */}
      <path d="M20,150 Q120,130 250,150 Q380,170 480,145" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
      <path d="M150,10 Q160,100 155,290" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
      <path d="M20,80 Q200,90 480,70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>

      {/* Routes */}
      {ROUTES.map(route => {
        const pts = route.waypoints.map(([lat, lng]) => project(lat, lng));
        const d = pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
        const isSelected = selectedRoute === route.id;
        return (
          <path key={route.id} d={d}
            fill="none"
            stroke={route.color}
            strokeWidth={isSelected ? 4 : 2}
            strokeDasharray={route.id === "R1" ? "none" : route.id === "R2" ? "8,4" : "4,4"}
            opacity={isSelected ? 1 : 0.45}
          />
        );
      })}

      {/* Incident zones */}
      <circle cx="310" cy="160" r="22" fill="rgba(163,45,45,0.18)" stroke="#a32d2d" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="310" y="164" textAnchor="middle" fontSize="9" fill="#f09595">⚠ GAS</text>
      <circle cx="390" cy="100" r="16" fill="rgba(186,117,23,0.18)" stroke="#ba7517" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="390" y="104" textAnchor="middle" fontSize="9" fill="#fac775">FLOOD</text>

      {/* Teams */}
      {teams.map(team => {
        const { x, y } = project(team.lat, team.lng);
        const col = team.status === "on-site" ? "#5DCAA5" : team.status === "en-route" ? "#85B7EB" : "#B4B2A9";
        return (
          <g key={team.id}>
            <circle cx={x} cy={y} r="10" fill={col} opacity="0.2"/>
            <circle cx={x} cy={y} r="5" fill={col}/>
            <text x={x} y={y - 12} textAnchor="middle" fontSize="9" fill={col} fontWeight="600">{team.name}</text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x="10" y="255" width="230" height="38" rx="4" fill="rgba(0,0,0,0.45)"/>
      {[["#5DCAA5","On-site"],["#85B7EB","En route"],["#B4B2A9","Standby"]].map(([c,l],i) => (
        <g key={l}>
          <circle cx={26 + i*76} cy="270" r="4" fill={c}/>
          <text x={34 + i*76} y="274" fontSize="9" fill="rgba(255,255,255,0.7)">{l}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Safety Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score, color, size = 56 }) {
  const r = 22; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{transition:"stroke-dasharray 0.6s ease"}}/>
      <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>{score}</text>
    </svg>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function App() {
  const [selectedRoute, setSelectedRoute] = useState("R1");
  const [tab, setTab] = useState("routes");
  const [tick, setTick] = useState(0);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("Ask me anything about current conditions, route safety, or team status.");
  const [aiLoading, setAiLoading] = useState(false);

  // Simulate live GPS drift
  const [liveTeams, setLiveTeams] = useState(TEAMS);
  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      setLiveTeams(ts => ts.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.0006,
        lng: t.lng + (Math.random() - 0.5) * 0.0006,
        battery: Math.max(5, t.battery - (Math.random() < 0.1 ? 1 : 0)),
      })));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const activeRoute = ROUTES.find(r => r.id === selectedRoute);

  async function askAI() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    const prompt = `You are an AI assistant embedded in a rescue operations dashboard. 
Current scenario: urban emergency, 4 rescue teams deployed. 
Routes: Route Alpha (safety 94, ETA 12min), Route Bravo (safety 71, ETA 18min, flooded underpass), Route Delta (safety 43, ETA 26min, gas leak + collapse risk).
Active alerts: gas leak Sector 9, bridge overload Route Bravo, Zone 3 evacuation complete.
Question from operator: ${aiQuery}
Give a concise, tactical 2-3 sentence response. Be direct and actionable.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "No response.";
      setAiResponse(text);
    } catch {
      setAiResponse("AI advisor offline. Check network.");
    } finally {
      setAiLoading(false);
      setAiQuery("");
    }
  }

  const statusColor = { "en-route": "#378add", "on-site": "#1D9E75", "standby": "#888780" };
  const statusBg = { "en-route": "rgba(55,138,221,0.12)", "on-site": "rgba(29,158,117,0.12)", "standby": "rgba(136,135,128,0.12)" };
  const tagColor = { "RECOMMENDED": "#1D9E75", "ALTERNATE": "#ba7517", "HIGH RISK": "#a32d2d" };
  const tagBg = { "RECOMMENDED": "rgba(29,158,117,0.12)", "ALTERNATE": "rgba(186,117,23,0.12)", "HIGH RISK": "rgba(163,45,45,0.12)" };
  const alertColor = { danger: "#e24b4a", warning: "#ef9f27", info: "#378add", success: "#1D9E75" };
  const alertBg = { danger: "rgba(226,75,74,0.08)", warning: "rgba(239,159,39,0.08)", info: "rgba(55,138,221,0.08)", success: "rgba(29,158,117,0.08)" };

  const styles = {
    root: {
      background: "#0d1117",
      minHeight: "100vh",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
    },
    topbar: {
      background: "#0d1117",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 32, height: 32, borderRadius: 8,
      background: "linear-gradient(135deg, #1D9E75, #185FA5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16,
    },
    logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.05em", color: "#fff" },
    logoSub: { fontSize: 10, color: "#5F5E5A", letterSpacing: "0.12em", textTransform: "uppercase" },
    statusBar: { display: "flex", gap: 20, alignItems: "center" },
    liveTag: {
      fontSize: 10, letterSpacing: "0.1em", color: "#1D9E75",
      border: "1px solid rgba(29,158,117,0.4)", borderRadius: 4,
      padding: "3px 8px", display: "flex", alignItems: "center", gap: 5,
    },
    liveDot: {
      width: 6, height: 6, borderRadius: "50%", background: "#1D9E75",
      animation: "pulse 1.5s ease-in-out infinite",
    },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    sidebar: {
      width: 280, flexShrink: 0,
      background: "#0d1117",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    },
    sideSection: { padding: "16px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    sectionLabel: { fontSize: 10, letterSpacing: "0.12em", color: "#5F5E5A", marginBottom: 12, textTransform: "uppercase" },
    teamCard: {
      background: "#13191f",
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 6,
      border: "1px solid rgba(255,255,255,0.05)",
      cursor: "default",
    },
    teamName: { fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 },
    teamMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    statusBadge: (status) => ({
      fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
      color: statusColor[status], background: statusBg[status],
      padding: "2px 6px", borderRadius: 3,
    }),
    battBar: { width: "100%", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1, marginTop: 6 },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    mapArea: {
      flex: "0 0 300px",
      background: "#0a0f14",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      position: "relative",
      overflow: "hidden",
    },
    mapLabel: {
      position: "absolute", top: 10, left: 12,
      fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)",
      textTransform: "uppercase",
    },
    mapTick: {
      position: "absolute", top: 10, right: 12,
      fontSize: 9, color: "#1D9E75",
    },
    panel: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    tabs: {
      display: "flex",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 20px",
      flexShrink: 0,
    },
    tab: (active) => ({
      padding: "12px 16px",
      fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
      color: active ? "#5DCAA5" : "#5F5E5A",
      borderBottom: active ? "2px solid #5DCAA5" : "2px solid transparent",
      cursor: "pointer", background: "none", border: "none",
      borderBottom: active ? "2px solid #5DCAA5" : "2px solid transparent",
      fontFamily: "inherit",
    }),
    tabContent: { flex: 1, overflowY: "auto", padding: 20 },
    routeCard: (selected, route) => ({
      background: selected ? "rgba(29,158,117,0.06)" : "#13191f",
      border: selected ? `1px solid rgba(29,158,117,0.3)` : "1px solid rgba(255,255,255,0.05)",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 10,
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    routeHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    routeName: { fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 },
    routeTag: (tag) => ({
      fontSize: 9, letterSpacing: "0.1em",
      color: tagColor[tag], background: tagBg[tag],
      padding: "3px 7px", borderRadius: 3,
    }),
    routeMetrics: { display: "flex", gap: 16, alignItems: "center", marginBottom: 10 },
    metric: { textAlign: "center" },
    metricVal: { fontSize: 18, fontWeight: 700, color: "#fff" },
    metricLabel: { fontSize: 9, color: "#5F5E5A", letterSpacing: "0.08em", textTransform: "uppercase" },
    hazardItem: {
      fontSize: 11, color: "#f09595",
      padding: "3px 0",
      display: "flex", alignItems: "center", gap: 6,
    },
    aiNote: {
      fontSize: 11, color: "#85B7EB",
      background: "rgba(55,138,221,0.07)",
      borderRadius: 5, padding: "7px 10px", marginTop: 8,
      borderLeft: "2px solid rgba(55,138,221,0.4)",
    },
    alertItem: (type) => ({
      background: alertBg[type],
      borderLeft: `2px solid ${alertColor[type]}`,
      borderRadius: 5,
      padding: "8px 12px",
      marginBottom: 8,
      display: "flex", gap: 12, alignItems: "flex-start",
    }),
    alertTime: { fontSize: 10, color: "#5F5E5A", flexShrink: 0, marginTop: 1 },
    alertMsg: { fontSize: 12, color: "#e2e8f0" },
    aiPanel: {
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "16px 20px",
      background: "#0d1117",
      flexShrink: 0,
    },
    aiHeader: { fontSize: 10, letterSpacing: "0.12em", color: "#378add", marginBottom: 8, textTransform: "uppercase" },
    aiBox: {
      background: "#13191f",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 12, color: "#b5d4f4",
      lineHeight: 1.6,
      marginBottom: 10,
      border: "1px solid rgba(55,138,221,0.15)",
      minHeight: 60,
    },
    aiInputRow: { display: "flex", gap: 8 },
    aiInput: {
      flex: 1,
      background: "#13191f",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 12, color: "#e2e8f0",
      fontFamily: "inherit",
      outline: "none",
    },
    aiBtn: {
      background: "rgba(55,138,221,0.15)",
      border: "1px solid rgba(55,138,221,0.3)",
      borderRadius: 6,
      padding: "8px 16px",
      fontSize: 11, color: "#85B7EB",
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.05em",
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Topbar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🛡️</div>
          <div>
            <div style={styles.logoText}>RESCUENET</div>
            <div style={styles.logoSub}>Emergency Ops Command</div>
          </div>
        </div>
        <div style={styles.statusBar}>
          <div style={styles.liveTag}>
            <div style={styles.liveDot}/>
            LIVE
          </div>
          <div style={{ fontSize: 11, color: "#5F5E5A" }}>
            {liveTeams.filter(t=>t.status==="en-route").length} en-route &nbsp;·&nbsp;
            {liveTeams.filter(t=>t.status==="on-site").length} on-site &nbsp;·&nbsp;
            {ALERTS.filter(a=>a.type==="danger").length} critical alerts
          </div>
          <div style={{ fontSize: 11, color: "#5F5E5A" }}>
            {new Date().toLocaleTimeString("en-IN", { hour12: false })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar: Teams */}
        <div style={styles.sidebar}>
          <div style={styles.sideSection}>
            <div style={styles.sectionLabel}>Active Teams ({liveTeams.length})</div>
            {liveTeams.map(team => (
              <div key={team.id} style={styles.teamCard}>
                <div style={styles.teamName}>{team.name} Team &nbsp;<span style={{fontSize:10,color:"#5F5E5A"}}>({team.members} pax)</span></div>
                <div style={styles.teamMeta}>
                  <span style={styles.statusBadge(team.status)}>{team.status.replace("-"," ")}</span>
                  <span style={{fontSize:10,color:team.battery<35?"#e24b4a":"#5F5E5A"}}>
                    🔋 {Math.round(team.battery)}%
                  </span>
                </div>
                <div style={styles.battBar}>
                  <div style={{
                    height:"100%", width:`${team.battery}%`, borderRadius:1,
                    background: team.battery < 35 ? "#a32d2d" : "#1D9E75",
                    transition: "width 1s ease",
                  }}/>
                </div>
                <div style={{fontSize:10,color:"#5F5E5A",marginTop:5}}>
                  {team.lat.toFixed(4)}°N {team.lng.toFixed(4)}°E
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div style={styles.sideSection}>
            <div style={styles.sectionLabel}>Incident Summary</div>
            {[
              ["247","Evacuated","#1D9E75"],
              ["3","Zones Active","#378add"],
              ["12","Civilians Remaining","#ef9f27"],
              ["2","Critical Hazards","#e24b4a"],
            ].map(([val,label,col]) => (
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:11,color:"#888780"}}>{label}</span>
                <span style={{fontSize:16,fontWeight:700,color:col}}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={styles.main}>
          {/* Map */}
          <div style={styles.mapArea}>
            <div style={styles.mapLabel}>TACTICAL MAP — LIVE GPS</div>
            <div style={styles.mapTick}>↻ {tick}s ago</div>
            <MiniMap teams={liveTeams} routes={ROUTES} selectedRoute={selectedRoute}/>
          </div>

          {/* Tabs */}
          <div style={styles.panel}>
            <div style={styles.tabs}>
              {[["routes","Routes & AI"], ["alerts","Alerts"]].map(([id,label]) => (
                <button key={id} style={styles.tab(tab===id)} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            <div style={styles.tabContent}>
              {tab === "routes" && ROUTES.map(route => (
                <div key={route.id}
                  style={styles.routeCard(selectedRoute===route.id, route)}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  <div style={styles.routeHeader}>
                    <div>
                      <div style={styles.routeName}>{route.name}</div>
                      <span style={styles.routeTag(route.tag)}>{route.tag}</span>
                    </div>
                    <ScoreRing score={route.safetyScore} color={route.color}/>
                  </div>
                  <div style={styles.routeMetrics}>
                    {[["ETA",route.eta],["DIST",route.distance],["SAFETY",`${route.safetyScore}/100`]].map(([l,v]) => (
                      <div key={l} style={styles.metric}>
                        <div style={{...styles.metricVal, fontSize:14}}>{v}</div>
                        <div style={styles.metricLabel}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {route.hazards.map(h => (
                    <div key={h} style={styles.hazardItem}>⚠ {h}</div>
                  ))}
                  <div style={styles.aiNote}>🤖 {route.aiNote}</div>
                </div>
              ))}

              {tab === "alerts" && ALERTS.map(alert => (
                <div key={alert.id} style={styles.alertItem(alert.type)}>
                  <div style={styles.alertTime}>{alert.time}</div>
                  <div style={styles.alertMsg}>{alert.msg}</div>
                </div>
              ))}
            </div>

            {/* AI Advisor */}
            <div style={styles.aiPanel}>
              <div style={styles.aiHeader}>🤖 AI Tactical Advisor</div>
              <div style={styles.aiBox}>
                {aiLoading ? "Analyzing conditions..." : aiResponse}
              </div>
              <div style={styles.aiInputRow}>
                <input
                  style={styles.aiInput}
                  placeholder="Ask about routes, hazards, team deployment..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askAI()}
                />
                <button style={styles.aiBtn} onClick={askAI} disabled={aiLoading}>
                  {aiLoading ? "..." : "ASK ↗"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

