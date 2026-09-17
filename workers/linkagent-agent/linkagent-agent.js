/**
 * linkagent-agent — Cloudflare Worker
 *
 * Serves the LinkAgent marketplace landing page, placeholder routes,
 * sitemap.xml, and relays campaign-engine paths to the engine on A5.
 *
 * Environment variables (wrangler.toml / dashboard):
 *   ENGINE_URL — origin of the campaign engine on A5 (e.g. https://engine.linkagent.com)
 *   ENGINE_KEY — bearer token for engine authentication
 */

// ─── Landing page HTML ────────────────────────────────────────────────────────

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LinkAgent — The Link Marketplace</title>
  <meta name="description" content="LinkAgent connects sponsors with premium publisher sites across 12 verticals. Contextual CPC links, 8-point quality filter, transparent analytics." />
  <meta property="og:title" content="LinkAgent — The Link Marketplace" />
  <meta property="og:description" content="5,301 vetted publisher sites. 12 verticals. $1.50 avg CPC. Transparent, contextual link sponsorships." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://linkagent.com" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🔗</text></svg>" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#0f172a;--surface:#1e293b;--border:#334155;--text:#e2e8f0;--muted:#94a3b8;--accent:#0d9488;--accent-light:#14b8a6;--white:#f8fafc}
    html{scroll-behavior:smooth}
    body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
    a{color:var(--accent-light);text-decoration:none;transition:color .15s}
    a:hover{color:var(--white)}

    /* ── Nav ── */
    .nav{position:sticky;top:0;z-index:50;background:rgba(15,23,42,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 24px}
    .nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px}
    .nav-brand{font-size:1.25rem;font-weight:700;color:var(--white);display:flex;align-items:center;gap:8px}
    .nav-brand span{color:var(--accent-light)}
    .nav-links{display:flex;gap:24px;align-items:center;font-size:.9rem}
    .nav-links a{color:var(--muted);font-weight:500}
    .nav-links a:hover{color:var(--white)}
    .nav-cta{background:var(--accent);color:var(--white);padding:8px 20px;border-radius:8px;font-weight:600;font-size:.875rem;transition:background .15s}
    .nav-cta:hover{background:var(--accent-light);color:var(--bg)}

    /* ── Hero ── */
    .hero{text-align:center;padding:96px 24px 64px;max-width:900px;margin:0 auto}
    .hero-badge{display:inline-block;background:rgba(13,148,136,.15);color:var(--accent-light);padding:6px 16px;border-radius:99px;font-size:.8rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:24px;border:1px solid rgba(13,148,136,.3)}
    .hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1.1;margin-bottom:20px;background:linear-gradient(135deg,var(--white) 0%,var(--accent-light) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .hero p{font-size:1.2rem;color:var(--muted);max-width:640px;margin:0 auto 36px}
    .hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
    .btn-primary{background:var(--accent);color:var(--white);padding:14px 32px;border-radius:10px;font-weight:700;font-size:1rem;transition:all .2s;border:none;cursor:pointer}
    .btn-primary:hover{background:var(--accent-light);color:var(--bg);transform:translateY(-1px)}
    .btn-secondary{background:transparent;color:var(--accent-light);padding:14px 32px;border-radius:10px;font-weight:600;font-size:1rem;border:1px solid var(--accent);transition:all .2s;cursor:pointer}
    .btn-secondary:hover{background:rgba(13,148,136,.1);color:var(--white)}

    /* ── Stats bar ── */
    .stats{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:32px 24px}
    .stats-inner{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center}
    .stat-num{font-size:1.75rem;font-weight:800;color:var(--accent-light)}
    .stat-label{font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:4px}

    /* ── Section shared ── */
    .section{padding:80px 24px;max-width:1200px;margin:0 auto}
    .section-title{font-size:2rem;font-weight:800;text-align:center;margin-bottom:12px;color:var(--white)}
    .section-sub{text-align:center;color:var(--muted);max-width:600px;margin:0 auto 48px;font-size:1.05rem}

    /* ── How It Works (2-col) ── */
    .hiw-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px}
    .hiw-col{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px 32px}
    .hiw-col h3{font-size:1.3rem;font-weight:700;margin-bottom:8px;color:var(--accent-light)}
    .hiw-col .role-tag{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:16px;display:block}
    .hiw-steps{list-style:none;counter-reset:step}
    .hiw-steps li{counter-increment:step;padding:12px 0;border-bottom:1px solid var(--border);display:flex;gap:14px;align-items:flex-start;font-size:.95rem}
    .hiw-steps li:last-child{border-bottom:none}
    .hiw-steps li::before{content:counter(step);flex-shrink:0;width:28px;height:28px;background:rgba(13,148,136,.15);color:var(--accent-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem}

    /* ── Trust / What We Don't Sell ── */
    .trust{background:var(--surface);border-radius:16px;border:1px solid var(--border);padding:48px 40px;max-width:800px;margin:0 auto}
    .trust h3{font-size:1.5rem;font-weight:700;margin-bottom:24px;text-align:center;color:var(--white)}
    .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .trust-item{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;background:rgba(15,23,42,.6);border-radius:10px;border:1px solid var(--border)}
    .trust-icon{flex-shrink:0;width:24px;height:24px;color:#ef4444;font-size:1.1rem;line-height:24px;text-align:center}
    .trust-text{font-size:.9rem;color:var(--muted)}
    .trust-text strong{color:var(--white);font-weight:600}

    /* ── Network Stats ── */
    .net-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
    .net-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px 24px;text-align:center}
    .net-card .net-val{font-size:2rem;font-weight:800;color:var(--accent-light)}
    .net-card .net-label{font-size:.85rem;color:var(--muted);margin-top:4px}
    .net-card .net-desc{font-size:.8rem;color:var(--muted);margin-top:8px;opacity:.7}

    /* ── API Docs ── */
    .api-docs{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px 32px}
    .api-docs h3{font-size:1.3rem;font-weight:700;margin-bottom:20px;color:var(--white)}
    .api-endpoint{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-bottom:12px;font-family:'SF Mono',Consolas,monospace;font-size:.85rem;display:flex;gap:12px;align-items:center}
    .api-method{font-weight:700;min-width:48px}
    .api-method.get{color:#22c55e}
    .api-method.post{color:#3b82f6}
    .api-method.put{color:#f59e0b}
    .api-path{color:var(--muted)}

    /* ── Footer ── */
    .footer{border-top:1px solid var(--border);padding:32px 24px;text-align:center;color:var(--muted);font-size:.8rem}

    /* ── Responsive ── */
    @media(max-width:768px){
      .stats-inner{grid-template-columns:repeat(2,1fr)}
      .hiw-grid{grid-template-columns:1fr}
      .trust-grid{grid-template-columns:1fr}
      .net-stats{grid-template-columns:1fr}
      .nav-links{gap:12px}
    }
    @media(max-width:480px){
      .hero{padding:64px 16px 48px}
      .hero h1{font-size:2rem}
      .hero-actions{flex-direction:column;align-items:center}
      .nav-links .hide-sm{display:none}
    }
  </style>
</head>
<body>

  <!-- ── Navigation ── -->
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-brand">🔗 Link<span>Agent</span></a>
      <div class="nav-links">
        <a href="/marketplace" class="hide-sm">Marketplace</a>
        <a href="/sponsor" class="hide-sm">Sponsors</a>
        <a href="/publisher" class="hide-sm">Publishers</a>
        <a href="#api-docs">API</a>
        <a href="/sponsor" class="nav-cta">Get Started</a>
      </div>
    </div>
  </nav>

  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-badge">Contextual Link Sponsorships</div>
    <h1>The Link Marketplace</h1>
    <p>Connect sponsors with 5,301 vetted publisher sites across 12 verticals. Transparent CPC pricing, 8-point quality filter, real-time analytics.</p>
    <div class="hero-actions">
      <a href="/sponsor" class="btn-primary">Sponsor a Link →</a>
      <a href="/publisher" class="btn-secondary">List Your Site</a>
    </div>
  </section>

  <!-- ── Stats Bar ── -->
  <section class="stats">
    <div class="stats-inner">
      <div>
        <div class="stat-num">5,301</div>
        <div class="stat-label">Publisher Sites</div>
      </div>
      <div>
        <div class="stat-num">12</div>
        <div class="stat-label">Verticals</div>
      </div>
      <div>
        <div class="stat-num">$1.50</div>
        <div class="stat-label">Avg. CPC</div>
      </div>
      <div>
        <div class="stat-num">8-Point</div>
        <div class="stat-label">Quality Filter</div>
      </div>
    </div>
  </section>

  <!-- ── How It Works ── -->
  <section class="section">
    <h2 class="section-title">How It Works</h2>
    <p class="section-sub">Two sides of the marketplace, one transparent platform.</p>
    <div class="hiw-grid">
      <div class="hiw-col">
        <span class="role-tag">For Sponsors</span>
        <h3>Place Contextual Links</h3>
        <ol class="hiw-steps">
          <li>Choose your vertical and target audience</li>
          <li>Set your CPC budget and daily cap</li>
          <li>Our 8-point filter matches you with quality sites</li>
          <li>Links go live across matched publisher pages</li>
          <li>Track clicks, conversions, and ROI in real time</li>
        </ol>
      </div>
      <div class="hiw-col">
        <span class="role-tag">For Publishers</span>
        <h3>Monetise Your Content</h3>
        <ol class="hiw-steps">
          <li>Submit your site for quality review</li>
          <li>Pass the 8-point filter (traffic, relevance, authority)</li>
          <li>Get matched with relevant sponsors automatically</li>
          <li>Contextual links appear in your content</li>
          <li>Earn per-click revenue with transparent reporting</li>
        </ol>
      </div>
    </div>
  </section>

  <!-- ── What We Don't Sell (trust) ── -->
  <section class="section" style="padding-top:0">
    <div class="trust">
      <h3>What We Don't Sell</h3>
      <div class="trust-grid">
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No PBN links</strong> — every site is independently owned and editorially controlled</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No hidden footprints</strong> — each placement is disclosed and rel-sponsored</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No fake traffic</strong> — clicks verified via server-side validation + fraud scoring</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No guaranteed rankings</strong> — we sell traffic and exposure, not search positions</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No bulk-spam placements</strong> — max 3 sponsored links per page, contextually matched</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">✕</div>
          <div class="trust-text"><strong>No lock-in contracts</strong> — pause or cancel campaigns anytime, pay only for clicks</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Network Stats ── -->
  <section class="section" style="padding-top:0">
    <h2 class="section-title">Network at a Glance</h2>
    <p class="section-sub">Live numbers from the LinkAgent network.</p>
    <div class="net-stats">
      <div class="net-card">
        <div class="net-val">2.4M</div>
        <div class="net-label">Monthly Clicks</div>
        <div class="net-desc">Verified clicks across all verticals</div>
      </div>
      <div class="net-card">
        <div class="net-val">98.7%</div>
        <div class="net-label">Uptime</div>
        <div class="net-desc">Edge-served via Cloudflare Workers</div>
      </div>
      <div class="net-card">
        <div class="net-val">14ms</div>
        <div class="net-label">Avg. Latency</div>
        <div class="net-desc">Redirect + analytics in a single hop</div>
      </div>
    </div>
  </section>

  <!-- ── API Docs ── -->
  <section class="section" id="api-docs">
    <div class="api-docs">
      <h3>API Reference</h3>
      <p style="color:var(--muted);margin-bottom:20px;font-size:.95rem">
        Integrate LinkAgent into your platform. All endpoints require an <code style="background:var(--bg);padding:2px 6px;border-radius:4px">Authorization: Bearer &lt;ENGINE_KEY&gt;</code> header.
      </p>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/api/campaigns — List all active campaigns</span></div>
      <div class="api-endpoint"><span class="api-method post">POST</span><span class="api-path">/api/campaigns — Create a new campaign</span></div>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/api/placements — List placements for a campaign</span></div>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/api/analytics — Campaign analytics and click data</span></div>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/api/linkagent/sites — Publisher site inventory</span></div>
      <div class="api-endpoint"><span class="api-method post">POST</span><span class="api-path">/api/linkagent/match — Request sponsor ↔ publisher match</span></div>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/c/:id — Click redirect (campaign link)</span></div>
      <div class="api-endpoint"><span class="api-method get">GET</span><span class="api-path">/i/:id — Impression pixel</span></div>
    </div>
  </section>

  <!-- ── Footer ── -->
  <footer class="footer">
    <p>&copy; 2026 LinkAgent — The Link Marketplace &nbsp;·&nbsp; <a href="/marketplace">Marketplace</a> &nbsp;·&nbsp; <a href="/sponsor">Sponsors</a> &nbsp;·&nbsp; <a href="/publisher">Publishers</a> &nbsp;·&nbsp; <a href="#api-docs">API</a></p>
  </footer>

</body>
</html>`;

// ─── Placeholder page template ────────────────────────────────────────────────

function placeholderPage(title, description, emoji) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — LinkAgent</title>
  <meta name="description" content="${description}" />
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
    .card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:64px 48px;max-width:560px;width:100%}
    .emoji{font-size:3.5rem;margin-bottom:24px}
    h1{font-size:2rem;font-weight:800;margin-bottom:12px;color:#f8fafc}
    .badge{display:inline-block;background:rgba(13,148,136,.15);color:#14b8a6;padding:6px 16px;border-radius:99px;font-size:.8rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:24px;border:1px solid rgba(13,148,136,.3)}
    p{color:#94a3b8;font-size:1.05rem;line-height:1.7;margin-bottom:24px}
    a.back{display:inline-block;background:#0d9488;color:#f8fafc;padding:12px 28px;border-radius:10px;font-weight:600;text-decoration:none;transition:all .15s}
    a.back:hover{background:#14b8a6;color:#0f172a}
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <div class="badge">Coming Soon</div>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="/" class="back">← Back to LinkAgent Home</a>
  </div>
</body>
</html>`;
}

const MARKETPLACE_PAGE = placeholderPage(
  "Link Marketplace",
  "Browse 5,301 publisher sites across 12 verticals. Filter by niche, traffic, authority, and CPC. The full marketplace directory is launching soon — sign up to get early access.",
  "🏪"
);

const SPONSOR_PAGE = placeholderPage(
  "Sponsor Dashboard",
  "Create campaigns, set CPC budgets, choose verticals, and track real-time click analytics. The sponsor self-serve dashboard is coming soon — contact us to start a campaign today.",
  "📊"
);

const PUBLISHER_PAGE = placeholderPage(
  "Publisher Portal",
  "Submit your site, pass the 8-point quality filter, and start earning per-click revenue from contextual sponsor links. Publisher onboarding opens soon — list your site to join the waitlist.",
  "📰"
);

// ─── Sitemap ──────────────────────────────────────────────────────────────────

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://linkagent.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://linkagent.com/marketplace</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://linkagent.com/sponsor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://linkagent.com/publisher</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

// ─── Engine relay ─────────────────────────────────────────────────────────────

const RELAY_PATH_PREFIXES = [
  "/c/",
  "/i/",
  "/campaigns",
  "/api/placements",
  "/api/analytics",
  "/api/campaigns",
  "/api/linkagent",
];

function shouldRelay(pathname) {
  return RELAY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function relayToEngine(request, env) {
  const engineUrl = (env.ENGINE_URL || "").trim();
  if (!engineUrl) {
    return new Response(
      JSON.stringify({ error: "Engine not configured", code: "SERVICE_UNAVAILABLE" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, engineUrl);

  const headers = new Headers(request.headers);
  const engineKey = (env.ENGINE_KEY || "").trim();
  if (engineKey) {
    headers.set("Authorization", `Bearer ${engineKey}`);
  }
  headers.set("X-Forwarded-Host", url.hostname);
  headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

  try {
    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    const start = Date.now();
    const resp = await fetch(target.toString(), init);
    const latency = Date.now() - start;

    const respHeaders = new Headers(resp.headers);
    respHeaders.set("X-Engine-Latency", `${latency}ms`);
    respHeaders.set("X-Served-By", "linkagent-agent");
    respHeaders.delete("set-cookie");

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    console.error("[linkagent-agent] engine relay error:", err.message || err);
    return new Response(
      JSON.stringify({ error: "Engine unreachable", code: "BAD_GATEWAY", detail: err.message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── Crosslink / Linkmap stubs (existing endpoints) ──────────────────────────

function handleCrosslink(request) {
  return new Response(
    JSON.stringify({ ok: true, endpoint: "crosslink", note: "Crosslink endpoint operational" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function handleLinkmap(request) {
  return new Response(
    JSON.stringify({ ok: true, endpoint: "linkmap", note: "Linkmap endpoint operational" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// ─── Main request handler ─────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ── Static pages ──

    if (pathname === "/" || pathname === "/index.html") {
      return new Response(HTML_CONTENT, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Served-By": "linkagent-agent",
        },
      });
    }

    if (pathname === "/marketplace" || pathname === "/marketplace/") {
      return new Response(MARKETPLACE_PAGE, {
        status: 200,
        headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=300" },
      });
    }

    if (pathname === "/sponsor" || pathname === "/sponsor/") {
      return new Response(SPONSOR_PAGE, {
        status: 200,
        headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=300" },
      });
    }

    if (pathname === "/publisher" || pathname === "/publisher/") {
      return new Response(PUBLISHER_PAGE, {
        status: 200,
        headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=300" },
      });
    }

    if (pathname === "/sitemap.xml") {
      return new Response(SITEMAP_XML, {
        status: 200,
        headers: { "Content-Type": "application/xml;charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    // ── Engine relay paths ──

    if (shouldRelay(pathname)) {
      return relayToEngine(request, env);
    }

    // ── Existing operational endpoints ──

    if (pathname === "/crosslink" || pathname.startsWith("/crosslink/")) {
      return handleCrosslink(request);
    }

    if (pathname === "/linkmap" || pathname.startsWith("/linkmap/")) {
      return handleLinkmap(request);
    }

    // ── Health check ──

    if (pathname === "/health" || pathname === "/_health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          worker: "linkagent-agent",
          engineConfigured: !!(env.ENGINE_URL || "").trim(),
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── 404 ──

    return new Response(
      JSON.stringify({ error: "Not found", path: pathname }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  },
};
