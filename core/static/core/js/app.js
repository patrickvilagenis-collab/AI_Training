/* =========================================================================
   AI Trainer — front-end application (vanilla JS, no frameworks)

   Responsibilities
   - Load curriculum from the backend (/api/curriculum)
   - Keep all progress in localStorage (works with NO account)
   - Optionally sync to a server account (/api/* endpoints)
   - Render three views: Dashboard (path), Lesson (quiz), Profile
   - Award XP, track daily streaks, and level up the learner
   ========================================================================= */

(function () {
    "use strict";

    // ----------------------------------------------------------------- utils
    const $ = (sel, root = document) => root.querySelector(sel);
    const app = $("#app");
    const toastEl = $("#toast");

    const STORAGE_KEY = "ai_trainer_progress_v1";
    const XP_PER_LEVEL = 100; // every 100 XP = one level

    // Read the CSRF token from the cookie. Django ROTATES this token on
    // login/logout, so the {% csrf_token %} hidden input goes stale after auth —
    // the cookie is always kept fresh, making it the reliable source.
    const getCsrf = () => {
        const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
        if (m) return decodeURIComponent(m[1]);
        const el = document.querySelector("[name=csrfmiddlewaretoken]");
        return el ? el.value : "";
    };

    const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dayDiff = (a, b) => {
        // whole-day difference between two YYYY-MM-DD strings
        const da = new Date(a + "T00:00:00");
        const db = new Date(b + "T00:00:00");
        return Math.round((db - da) / 86400000);
    };

    const escapeHtml = (s) =>
        String(s).replace(/[&<>"']/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
        );

    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
    }

    // ------------------------------------------------------------ app state
    const state = {
        data: null,        // curriculum from server
        progress: null,    // learner progress (persisted)
        account: { authenticated: false, username: null },
        view: "dashboard", // dashboard | profile
    };

    function defaultProgress() {
        return {
            xp: 0,
            completed: {},        // { sessionId: true }
            streak: 0,
            lastActive: null,     // YYYY-MM-DD
            history: [],          // [YYYY-MM-DD, ...] days a session was finished
            startedAt: todayStr(),
        };
    }

    function loadLocal() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return Object.assign(defaultProgress(), JSON.parse(raw));
        } catch (e) { /* ignore corrupt data */ }
        return defaultProgress();
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
        } catch (e) { /* storage may be full / disabled */ }
        // If logged in, mirror to the server (best-effort, non-blocking).
        if (state.account.authenticated) {
            api("/api/progress", { progress: state.progress }).catch(() => {});
        }
    }

    // --------------------------------------------------------------- network
    async function api(url, body) {
        const opts = {
            method: body ? "POST" : "GET",
            headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrf() },
            credentials: "same-origin",
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        let json = {};
        try { json = await res.json(); } catch (e) { /* no body */ }
        if (!res.ok) throw json;
        return json;
    }

    // --------------------------------------------------------- derived stats
    const level = () => Math.floor(state.progress.xp / XP_PER_LEVEL) + 1;
    const levelProgress = () => state.progress.xp % XP_PER_LEVEL;

    function allSessions() {
        const out = [];
        state.data.weeks.forEach((w) =>
            w.sessions.forEach((s) => out.push({ week: w, session: s }))
        );
        return out;
    }

    function isDone(id) { return !!state.progress.completed[id]; }

    // A session unlocks when the previous one (in order) is complete.
    function isUnlocked(index, flat) {
        if (index === 0) return true;
        return isDone(flat[index - 1].session.id);
    }

    function nextSessionIndex(flat) {
        for (let i = 0; i < flat.length; i++) {
            if (!isDone(flat[i].session.id)) return i;
        }
        return flat.length - 1;
    }

    // ----------------------------------------------------- streak management
    function touchStreak() {
        const p = state.progress;
        const today = todayStr();
        if (p.lastActive === today) return; // already counted today
        if (p.lastActive && dayDiff(p.lastActive, today) === 1) {
            p.streak += 1;             // consecutive day
        } else {
            p.streak = 1;              // reset / first day
        }
        p.lastActive = today;
        if (!p.history.includes(today)) p.history.push(today);
    }

    // Lazily decay a stale streak (missed a day) when the app loads.
    function reconcileStreak() {
        const p = state.progress;
        if (p.lastActive && dayDiff(p.lastActive, todayStr()) > 1) {
            p.streak = 0;
        }
    }

    // =========================================================== RENDERING ==
    function render() {
        if (state.view === "profile") return renderProfile();
        return renderDashboard();
    }

    function topbar() {
        const p = state.progress;
        return `
        <div class="topbar">
            <div class="brand"><span class="logo">🤖</span> AI Trainer</div>
            <div class="stats">
                <div class="stat streak" title="Day streak"><span class="ico">🔥</span>${p.streak}</div>
                <div class="stat xp" title="Total XP"><span class="ico">⭐</span>${p.xp}</div>
                <div class="stat gem" title="Level"><span class="ico">🏅</span>${level()}</div>
            </div>
        </div>`;
    }

    function bottomNav() {
        return `
        <div class="bottom-nav">
            <button data-nav="dashboard" class="${state.view === "dashboard" ? "active" : ""}">
                <span class="ico">🏠</span> Learn
            </button>
            <button data-nav="profile" class="${state.view === "profile" ? "active" : ""}">
                <span class="ico">👤</span> Profile
            </button>
        </div>`;
    }

    // ---------------------------------------------------------- DASHBOARD
    function renderDashboard() {
        const flat = allSessions();
        const nextIdx = nextSessionIndex(flat);
        const current = flat[nextIdx];
        const currentWeek = current.week;

        // Week progress
        const weekSessions = currentWeek.sessions;
        const weekDone = weekSessions.filter((s) => isDone(s.id)).length;
        const weekPct = Math.round((weekDone / weekSessions.length) * 100);

        // Overall progress
        const doneCount = flat.filter((f) => isDone(f.session.id)).length;
        const overallPct = Math.round((doneCount / flat.length) * 100);

        const accountChip = state.account.authenticated
            ? `<button class="btn ghost sm" data-action="logout">👋 ${escapeHtml(state.account.username)}</button>`
            : `<button class="btn secondary sm" data-action="show-auth">Save progress</button>`;

        // Build the winding session path for the current week.
        const pathHtml = weekSessions.map((s) => {
            const globalIndex = flat.findIndex((f) => f.session.id === s.id);
            const unlocked = isUnlocked(globalIndex, flat);
            const done = isDone(s.id);
            const isCurrent = globalIndex === nextIdx;
            let cls = "node";
            if (done) cls += " done";
            else if (!unlocked) cls += " locked";
            if (isCurrent && !done) cls += " current";
            const icon = done ? "✓" : (!unlocked ? "🔒" : "★");
            return `
            <div class="node-row">
                <button class="${cls}" data-session="${s.id}" ${unlocked ? "" : "disabled"}>${icon}</button>
                <div class="node-meta">
                    <div class="t">${escapeHtml(s.title)}</div>
                    <div class="s">${escapeHtml(s.subtitle)}</div>
                    <div class="xp">+${s.xp} XP</div>
                </div>
            </div>`;
        }).join("");

        const upcoming = state.data.upcoming.map((u) => `
            <div class="card teaser">
                <div class="ico">${u.icon}</div>
                <div>
                    <div class="t">${escapeHtml(u.title)}</div>
                    <div class="s">${escapeHtml(u.subtitle)}</div>
                </div>
                <div class="lock">🔒</div>
            </div>`).join("");

        // All weeks overview chips
        const weekChips = state.data.weeks.map((w, i) => {
            const wDone = w.sessions.every((s) => isDone(s.id));
            const wStarted = w.sessions.some((s) => isDone(s.id));
            const status = wDone ? "✓ Done" : (wStarted ? "In progress" : (w === currentWeek ? "Current" : "Locked"));
            return `
            <div class="card teaser">
                <div class="ico" style="background:${w.color}22">${w.icon}</div>
                <div>
                    <div class="t">Week ${i + 1}: ${escapeHtml(w.title)}</div>
                    <div class="s">${escapeHtml(w.subtitle)}</div>
                </div>
                <div class="lock" style="font-weight:800;font-size:12px;color:var(--ink-soft)">${status}</div>
            </div>`;
        }).join("");

        app.innerHTML = `
        ${topbar()}
        <div style="display:flex;justify-content:flex-end;margin:-2px 0 8px">${accountChip}</div>

        <div class="week-banner" style="background:${currentWeek.color}">
            <div class="eyebrow">This week's topic</div>
            <h2>${escapeHtml(currentWeek.title)}</h2>
            <p>${escapeHtml(currentWeek.subtitle)}</p>
            <div class="big-icon">${currentWeek.icon}</div>
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;font-weight:800;margin-bottom:8px">
                <span>Week progress</span><span>${weekDone}/${weekSessions.length} sessions</span>
            </div>
            <div class="progress"><span style="width:${weekPct}%"></span></div>
        </div>

        <div class="section-title">Your path · ~5 min each</div>
        <div class="path">${pathHtml}</div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;font-weight:800;margin-bottom:8px">
                <span>Overall progress</span><span>${overallPct}%</span>
            </div>
            <div class="progress thin"><span style="width:${overallPct}%"></span></div>
        </div>

        <div class="section-title">All weeks</div>
        ${weekChips}

        <div class="section-title">Coming soon</div>
        ${upcoming}

        ${bottomNav()}
        `;
    }

    // ------------------------------------------------------------ PROFILE
    function renderProfile() {
        const p = state.progress;
        const flat = allSessions();
        const doneCount = flat.filter((f) => isDone(f.session.id)).length;
        const initial = state.account.authenticated
            ? state.account.username[0].toUpperCase() : "🤖";

        // last 7 days streak strip
        const labels = ["S", "M", "T", "W", "T", "F", "S"];
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().slice(0, 10);
            days.push({
                hit: p.history.includes(ds),
                lbl: labels[d.getDay()],
            });
        }
        const streakStrip = days.map((d) => `
            <div class="streak-day ${d.hit ? "hit" : ""}">
                <div class="lbl">${d.lbl}</div>
                <div class="dot">${d.hit ? "🔥" : ""}</div>
            </div>`).join("");

        const accountBlock = state.account.authenticated
            ? `<button class="btn danger" data-action="logout">Log out</button>`
            : `<button class="btn blue" data-action="show-auth">Create account / Log in</button>
               <p class="muted center mt" style="font-size:13px">Your progress is saved on this device. Create a free account to sync it across devices.</p>`;

        app.innerHTML = `
        ${topbar()}
        <div class="profile-head">
            <div class="avatar">${initial}</div>
            <h2 style="margin:0">${state.account.authenticated ? escapeHtml(state.account.username) : "Guest learner"}</h2>
            <p class="muted" style="margin:4px 0 0">Level ${level()} · ${levelProgress()}/${XP_PER_LEVEL} XP to next</p>
        </div>

        <div class="card">
            <div class="progress"><span style="width:${levelProgress()}%"></span></div>
        </div>

        <div class="kpi-grid">
            <div class="kpi"><div class="v">🔥 ${p.streak}</div><div class="l">Day streak</div></div>
            <div class="kpi"><div class="v">⭐ ${p.xp}</div><div class="l">Total XP</div></div>
            <div class="kpi"><div class="v">🏅 ${level()}</div><div class="l">Level</div></div>
            <div class="kpi"><div class="v">✅ ${doneCount}</div><div class="l">Lessons done</div></div>
        </div>

        <div class="section-title">This week's activity</div>
        <div class="card">
            <div class="streak-week">${streakStrip}</div>
        </div>

        <div class="section-title">Account</div>
        <div class="card">${accountBlock}</div>

        ${bottomNav()}
        `;
    }

    // ============================================================ LESSON ====
    const lesson = {
        flat: null,
        week: null,
        session: null,
        exercises: null,
        i: 0,
        correct: 0,
        answered: false,
    };

    function startSession(sessionId) {
        const flat = allSessions();
        const entry = flat.find((f) => f.session.id === sessionId);
        if (!entry) return;
        lesson.week = entry.week;
        lesson.session = entry.session;
        lesson.exercises = entry.session.exercises;
        lesson.i = 0;
        lesson.correct = 0;
        lesson.answered = false;
        window.scrollTo(0, 0);
        renderExercise();
    }

    function lessonHeader() {
        const pct = Math.round((lesson.i / lesson.exercises.length) * 100);
        return `
        <div class="lesson-top">
            <button class="x" data-action="quit-lesson" aria-label="Quit">✕</button>
            <div class="bar"><div class="progress"><span style="width:${pct}%"></span></div></div>
        </div>`;
    }

    function renderExercise() {
        lesson.answered = false;
        const ex = lesson.exercises[lesson.i];
        let bodyHtml = "";

        if (ex.type === "info") {
            bodyHtml = `
            <div class="info-card">
                <div class="emoji">${pickEmoji(ex.title)}</div>
                <h3>${escapeHtml(ex.title)}</h3>
                <div class="body">${ex.body}</div>
            </div>`;
        } else if (ex.type === "mcq" || ex.type === "fill_blank") {
            const sub = ex.type === "fill_blank" ? "Fill in the blank" : "Select the correct answer";
            const opts = ex.options.map((o, idx) => `
                <button class="opt" data-opt="${idx}">
                    <span class="key">${idx + 1}</span><span>${escapeHtml(o)}</span>
                </button>`).join("");
            bodyHtml = `
            <div class="q-sub">${sub}</div>
            <div class="q-prompt">${escapeHtml(ex.prompt)}</div>
            <div class="options">${opts}</div>`;
        } else if (ex.type === "true_false") {
            bodyHtml = `
            <div class="q-sub">True or false?</div>
            <div class="q-prompt">${escapeHtml(ex.prompt)}</div>
            <div class="options">
                <button class="opt" data-tf="true"><span class="key">✓</span><span>True</span></button>
                <button class="opt" data-tf="false"><span class="key">✕</span><span>False</span></button>
            </div>`;
        } else if (ex.type === "matching") {
            bodyHtml = renderMatching(ex);
        }

        app.innerHTML = `
            ${lessonHeader()}
            <div class="q-wrap">${bodyHtml}</div>
            <div class="action-bar" id="actionBar">
                <div class="action-bar-inner">
                    <button class="btn" id="checkBtn" disabled>
                        ${ex.type === "info" ? "Continue" : "Check"}
                    </button>
                </div>
            </div>
        `;

        wireExercise(ex);
    }

    // a tiny bit of personality: choose an emoji from the title's own text
    function pickEmoji(title) {
        const m = (title + "").match(/\p{Emoji}/u);
        return m ? m[0] : "💡";
    }

    // ---- exercise wiring ---------------------------------------------------
    function wireExercise(ex) {
        const checkBtn = $("#checkBtn");

        if (ex.type === "info") {
            checkBtn.disabled = false;
            checkBtn.onclick = () => advance(true);
            return;
        }

        if (ex.type === "matching") {
            wireMatching(ex, checkBtn);
            return;
        }

        // MCQ / fill_blank / true_false share single-select behaviour
        let selected = null;
        const opts = Array.from(app.querySelectorAll(".opt"));
        opts.forEach((btn) => {
            btn.onclick = () => {
                if (lesson.answered) return;
                opts.forEach((b) => b.classList.remove("selected"));
                btn.classList.add("selected");
                selected = btn;
                checkBtn.disabled = false;
            };
        });

        checkBtn.onclick = () => {
            if (lesson.answered || selected === null) return;
            let chosen, correct, correctEl;
            if (ex.type === "true_false") {
                chosen = selected.dataset.tf === "true";
                correct = chosen === ex.answer;
                correctEl = opts.find((b) => (b.dataset.tf === "true") === ex.answer);
            } else {
                chosen = parseInt(selected.dataset.opt, 10);
                correct = chosen === ex.answer;
                correctEl = opts[ex.answer];
            }
            lesson.answered = true;
            opts.forEach((b) => (b.disabled = true));
            if (correct) {
                selected.classList.remove("selected");
                selected.classList.add("correct");
            } else {
                selected.classList.remove("selected");
                selected.classList.add("wrong");
                if (correctEl) correctEl.classList.add("correct");
            }
            showFeedback(correct, ex.explain);
        };
    }

    // ---- matching exercise -------------------------------------------------
    function renderMatching(ex) {
        // left items in order; right items shuffled deterministically per render
        const lefts = ex.pairs.map((p, i) => ({ text: p[0], id: i }));
        const rights = ex.pairs.map((p, i) => ({ text: p[1], id: i }));
        shuffle(rights);
        // stash for wiring
        lesson._match = { lefts, rights, ex };
        const colL = lefts.map((l) => `<button class="chip" data-side="L" data-id="${l.id}">${escapeHtml(l.text)}</button>`).join("");
        const colR = rights.map((r) => `<button class="chip" data-side="R" data-id="${r.id}">${escapeHtml(r.text)}</button>`).join("");
        return `
        <div class="q-sub">Tap a match on each side</div>
        <div class="q-prompt">${escapeHtml(ex.prompt)}</div>
        <div class="match-cols">
            <div class="match-col">${colL}</div>
            <div class="match-col">${colR}</div>
        </div>`;
    }

    function wireMatching(ex, checkBtn) {
        const chips = Array.from(app.querySelectorAll(".chip"));
        let pickedL = null, pickedR = null;
        let matchedCount = 0;
        let anyWrong = false;
        const total = ex.pairs.length;

        function tryResolve() {
            if (pickedL && pickedR) {
                const good = pickedL.dataset.id === pickedR.dataset.id;
                [pickedL, pickedR].forEach((c) => {
                    c.classList.remove("selected");
                    c.classList.add("matched");
                    if (!good) c.classList.add("bad");
                    c.disabled = true;
                });
                if (!good) anyWrong = true;
                matchedCount += 1;
                pickedL = pickedR = null;
                if (matchedCount === total) {
                    lesson.answered = true;
                    showFeedback(!anyWrong, ex.explain);
                }
            }
        }

        chips.forEach((chip) => {
            chip.onclick = () => {
                if (chip.disabled || lesson.answered) return;
                const side = chip.dataset.side;
                if (side === "L") {
                    if (pickedL) pickedL.classList.remove("selected");
                    pickedL = chip;
                } else {
                    if (pickedR) pickedR.classList.remove("selected");
                    pickedR = chip;
                }
                chip.classList.add("selected");
                tryResolve();
            };
        });

        // Matching auto-checks as pairs are made; hide the Check button.
        checkBtn.parentElement.parentElement.classList.add("hide");
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ---- feedback + advance ------------------------------------------------
    function showFeedback(correct, explain) {
        if (correct) lesson.correct += 1;
        const fb = document.createElement("div");
        fb.className = "feedback " + (correct ? "good" : "bad");
        fb.innerHTML = `
            <div class="feedback-inner">
                <div class="head">${correct ? "🎉 Nice!" : "💡 Not quite"}</div>
                <div class="explain">${explain ? escapeHtml(explain) : ""}</div>
                <button class="btn ${correct ? "good" : "bad"}" id="contBtn">Continue</button>
            </div>`;
        document.body.appendChild(fb);
        requestAnimationFrame(() => fb.classList.add("show"));
        $("#contBtn").onclick = () => {
            fb.remove();
            advance(correct);
        };
    }

    function advance() {
        lesson.i += 1;
        if (lesson.i >= lesson.exercises.length) {
            finishSession();
        } else {
            window.scrollTo(0, 0);
            renderExercise();
        }
    }

    function quitLesson() {
        // discard progress within the lesson; return to dashboard
        state.view = "dashboard";
        render();
    }

    // ---- completion --------------------------------------------------------
    function finishSession() {
        const s = lesson.session;
        const firstTime = !isDone(s.id);
        const earnedXp = s.xp;

        if (firstTime) {
            state.progress.completed[s.id] = true;
            state.progress.xp += earnedXp;
        }
        const beforeStreak = state.progress.streak;
        touchStreak();
        const streakUp = state.progress.streak > beforeStreak;
        persist();

        launchConfetti();

        const accuracy = Math.round((lesson.correct / lesson.exercises.length) * 100);
        const newLevel = level();

        app.innerHTML = `
        <div class="done-screen">
            <div class="trophy">🏆</div>
            <h2>Session complete!</h2>
            <div class="reward-row">
                <div class="reward">
                    <div class="label">XP earned</div>
                    <div class="value">+${firstTime ? earnedXp : 0}</div>
                </div>
                <div class="reward">
                    <div class="label">Accuracy</div>
                    <div class="value">${accuracy}%</div>
                </div>
                <div class="reward">
                    <div class="label">${streakUp ? "Streak 🔥" : "Day streak"}</div>
                    <div class="value">${state.progress.streak}</div>
                </div>
            </div>
            <p class="muted">${firstTime
                ? "New lesson unlocked! You're now level " + newLevel + "."
                : "Great review! XP is only awarded the first time."}</p>
            <div style="max-width:420px;margin:18px auto 0">
                <button class="btn" data-action="continue-learning">Keep going</button>
                ${!state.account.authenticated
                    ? '<button class="btn secondary mt" data-action="show-auth">Save my progress</button>' : ""}
            </div>
        </div>`;
    }

    function launchConfetti() {
        const colors = ["#58cc02", "#1cb0f6", "#ce82ff", "#ffc800", "#ff4b4b"];
        const wrap = document.createElement("div");
        wrap.className = "confetti";
        for (let i = 0; i < 80; i++) {
            const p = document.createElement("i");
            p.style.left = Math.random() * 100 + "vw";
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
            p.style.animationDelay = Math.random() * 0.4 + "s";
            wrap.appendChild(p);
        }
        document.body.appendChild(wrap);
        setTimeout(() => wrap.remove(), 3600);
    }

    // =============================================================== AUTH ===
    function showAuth(mode) {
        mode = mode || "register";
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
        <div class="modal">
            <h3 id="authTitle">${mode === "register" ? "Create your account" : "Welcome back"}</h3>
            <p class="sub">${mode === "register"
                ? "Free — sync your streak & XP across devices." : "Log in to load your progress."}</p>
            <div class="field">
                <label>Username</label>
                <input id="authUser" autocomplete="username" placeholder="e.g. ai_explorer" />
            </div>
            <div class="field">
                <label>Password</label>
                <input id="authPass" type="password" autocomplete="${mode === "register" ? "new-password" : "current-password"}" placeholder="At least 6 characters" />
            </div>
            <div class="form-error" id="authError"></div>
            <button class="btn" id="authSubmit">${mode === "register" ? "Create account" : "Log in"}</button>
            <button class="btn ghost mt" id="authCancel">Maybe later</button>
            <div class="switch">
                ${mode === "register"
                    ? `Already have an account? <button id="authSwitch">Log in</button>`
                    : `New here? <button id="authSwitch">Create account</button>`}
            </div>
        </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        $("#authCancel", overlay).onclick = close;
        $("#authSwitch", overlay).onclick = () => { close(); showAuth(mode === "register" ? "login" : "register"); };

        const submit = async () => {
            const username = $("#authUser", overlay).value.trim();
            const password = $("#authPass", overlay).value;
            const errEl = $("#authError", overlay);
            errEl.textContent = "";
            const btn = $("#authSubmit", overlay);
            btn.disabled = true;
            try {
                const url = mode === "register" ? "/api/register" : "/api/login";
                // On register we hand the server our local progress to seed the account.
                const payload = mode === "register"
                    ? { username, password, progress: state.progress }
                    : { username, password };
                const res = await api(url, payload);
                state.account = { authenticated: true, username: res.username };

                // On login, merge whatever the server has with local (keep best).
                if (mode === "login" && res.progress && Object.keys(res.progress).length) {
                    state.progress = mergeProgress(state.progress, res.progress);
                }
                persist();
                close();
                toast(mode === "register" ? "Account created! 🎉" : "Welcome back! 👋");
                render();
            } catch (err) {
                errEl.textContent = (err && err.error) || "Something went wrong. Try again.";
                btn.disabled = false;
            }
        };
        $("#authSubmit", overlay).onclick = submit;
        $("#authPass", overlay).onkeydown = (e) => { if (e.key === "Enter") submit(); };
        setTimeout(() => $("#authUser", overlay).focus(), 50);
    }

    // Keep the most progress when merging two states (e.g. local vs server).
    function mergeProgress(a, b) {
        const merged = Object.assign(defaultProgress(), b, a);
        merged.xp = Math.max(a.xp || 0, b.xp || 0);
        merged.streak = Math.max(a.streak || 0, b.streak || 0);
        merged.completed = Object.assign({}, b.completed, a.completed);
        const hist = new Set([...(a.history || []), ...(b.history || [])]);
        merged.history = Array.from(hist).sort();
        // lastActive = the more recent of the two
        merged.lastActive = [a.lastActive, b.lastActive].filter(Boolean).sort().pop() || null;
        return merged;
    }

    async function doLogout() {
        try { await api("/api/logout", {}); } catch (e) { /* ignore */ }
        state.account = { authenticated: false, username: null };
        toast("Logged out. Progress stays on this device.");
        render();
    }

    // ========================================================= EVENT DELEGATION
    document.addEventListener("click", (e) => {
        const navBtn = e.target.closest("[data-nav]");
        if (navBtn) { state.view = navBtn.dataset.nav; render(); return; }

        const sessionBtn = e.target.closest("[data-session]");
        if (sessionBtn && !sessionBtn.disabled) { startSession(sessionBtn.dataset.session); return; }

        const actionBtn = e.target.closest("[data-action]");
        if (actionBtn) {
            const a = actionBtn.dataset.action;
            if (a === "show-auth") showAuth("register");
            else if (a === "logout") doLogout();
            else if (a === "quit-lesson") quitLesson();
            else if (a === "continue-learning") { state.view = "dashboard"; render(); }
        }
    });

    // keyboard shortcuts: 1-6 to pick options, Enter to check/continue
    document.addEventListener("keydown", (e) => {
        if (/^[1-6]$/.test(e.key)) {
            const opt = app.querySelector(`.opt[data-opt="${parseInt(e.key, 10) - 1}"]`);
            if (opt && !opt.disabled) opt.click();
        } else if (e.key === "Enter") {
            const cont = $("#contBtn") || $("#checkBtn");
            if (cont && !cont.disabled) cont.click();
        }
    });

    // ================================================================= BOOT ==
    async function boot() {
        state.progress = loadLocal();
        reconcileStreak();

        // Load curriculum + account status in parallel.
        try {
            const [curr, meRes] = await Promise.all([
                api("/api/curriculum"),
                api("/api/me").catch(() => ({ authenticated: false })),
            ]);
            state.data = curr;
            if (meRes.authenticated) {
                state.account = { authenticated: true, username: meRes.username };
                if (meRes.progress && Object.keys(meRes.progress).length) {
                    state.progress = mergeProgress(state.progress, meRes.progress);
                }
            }
            persist();
            render();
        } catch (err) {
            app.innerHTML = `
            <div class="hero">
                <div class="mascot">😵</div>
                <h1>Couldn't load lessons</h1>
                <p>Please refresh the page to try again.</p>
            </div>`;
        }
    }

    boot();
})();
