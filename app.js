/* יומן המשלחת. אין כאן נתונים: הכול נשלף מהשרת עם מפתח המכשיר, והקבצים נפתחים בקישורים חתומים לשעה.
   תמונות עוברות קידוד מחדש בטלפון לפני ההעלאה, וכך נמחקים מהן המיקום וכל שאר נתוני הצילום. */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});

  var SB = 'https://ndrhiikczkbosentclnh.supabase.co';
  var KEY = 'sb_publishable_EckoZz1eIoRjjjQ9XhXhzA_EpuKVWQG';
  var TZ = 'Europe/London';
  var LS_S = 'yoman-s', LS_T = 'yoman-t';
  var TRIP = ['2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26'];
  var FILE_EXT = ['pdf', 'pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'];
  var MAX_IMG = 10, MAX_FILE_MB = 25;
  var $app = document.getElementById('app');

  var S = {
    s: lsGet(LS_S), t: lsGet(LS_T), me: null, posts: [], more: false, day: null,
    urls: {}, open: {}, showAll: {}, expanded: {}, offline: false, loading: false,
    draft: null, editingC: {}
  };

  /* ---------- עזר ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var ICONS = {
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
    comment: '<path d="M20.5 12a8 8 0 0 1-11.9 7l-4.1 1.1 1.1-3.9A8 8 0 1 1 20.5 12z"/>',
    share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.8-4.8-8.2 8.3"/>',
    file: '<path d="M14 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9z"/><path d="M14 3.5V9h5.5M8.5 13.5h7M8.5 17h5"/>',
    clip: '<path d="m20 11.5-7.9 7.9a5 5 0 0 1-7.1-7.1l8.3-8.3a3.3 3.3 0 0 1 4.7 4.7l-8.3 8.3a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6"/>',
    dots: '<circle cx="12" cy="5.5" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="12" cy="18.5" r=".9"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12h15M13 5.5 19.5 12 13 18.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><path d="M4 4l16 16"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.2a1.5 1.5 0 0 0 1.5 1.3h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5z"/>',
    out: '<path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
    users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14a6.5 6.5 0 0 1 3.5 5.5"/>',
    left: '<path d="m15 5-7 7 7 7"/>', right: '<path d="m9 5 7 7-7 7"/>',
    download: '<path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5M5 20.5h14"/>',
    pen: '<path d="M15.5 4.5l4 4L8.5 19.5H4.5v-4z"/><path d="M13 7l4 4"/>'
  };
  function ic(n, label) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + '</svg>' + (label ? '<span class="sr">' + esc(label) + '</span>' : ''); }

  function initial(name) { return esc((name || '?').trim().charAt(0)); }
  function avc(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return 'c' + (1 + h % 6); }
  // הדמויות מהמשחק "Mind the Gap" (האיורים של ניר), ושמותיהן כמו בחידון
  var CHARS = [['adele', 'אדל'], ['austen', 'ג\'יין אוסטן'], ['bean', 'רואן אטקינסון'], ['bond', 'שון קונרי'], ['bowie', 'דייוויד בואי'], ['chaplin', 'צ\'רלי צ\'פלין'],
    ['charles', 'המלך צ\'ארלס'], ['churchill', 'וינסטון צ\'רצ\'יל'], ['cleese', 'ג\'ון קליז'], ['dench', 'ג\'ודי דנץ\''], ['elton', 'אלטון ג\'ון'], ['hitchcock', 'אלפרד היצ\'קוק'],
    ['mercury', 'פרדי מרקורי'], ['potter', 'הארי פוטר'], ['queen', 'המלכה אליזבת'], ['smith', 'מגי סמית\''], ['thatcher', 'מרגרט תאצ\'ר'], ['winehouse', 'איימי ווינהאוס']];
  function avatarOf(name) { return S.me && S.me.avatars ? S.me.avatars[name] || null : null; }
  function av(name) {
    var a = avatarOf(name), img = '';
    if (a && /^q:[a-z]+$/.test(a)) img = '<img src="assets/av/' + a.slice(2) + '.webp" alt="">';
    else if (a) img = '<img data-path="' + esc(a) + '" alt="">';
    return '<span class="av ' + avc(name || '') + (a && a.indexOf('q:') === 0 ? ' q' : '') + '" aria-hidden="true">' + initial(name) + img + '</span>';
  }

  function londonParts(d) {
    var o = {}; new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d).forEach(function (x) { o[x.type] = x.value; });
    return { date: o.year + '-' + o.month + '-' + o.day, hm: (o.hour === '24' ? '00' : o.hour) + ':' + o.minute };
  }
  var WD = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  function dayName(iso) { var p = iso.split('-'); return WD[new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay()]; }
  function dShort(iso) { var p = iso.split('-'); return (+p[2]) + '.' + (+p[1]); }
  function when(at) {
    var d = new Date(at), now = new Date(), diff = (now - d) / 1000;
    if (diff < 60) return 'הרגע';
    if (diff < 3600) { var m = Math.floor(diff / 60); return m === 1 ? 'לפני דקה' : 'לפני ' + m + ' דקות'; }
    var p = londonParts(d), t = londonParts(now);
    if (p.date === t.date) return 'היום, ' + p.hm;
    var y = londonParts(new Date(now.getTime() - 864e5));
    if (p.date === y.date) return 'אתמול, ' + p.hm;
    return 'יום ' + dayName(p.date) + ' ' + dShort(p.date) + ', ' + p.hm;
  }
  function fmtSize(b) { if (!b) return ''; if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
  function extOf(name) { var m = /\.([a-z0-9]+)$/i.exec(name || ''); return m ? m[1].toLowerCase() : ''; }
  function linkify(t) {
    return esc(t).replace(/(https?:\/\/[^\s<]+[^\s<.,:;"')\]])/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>'; });
  }
  var toastT;
  function toast(msg) {
    var el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 3200);
  }

  /* ---------- שרת ---------- */
  function rpc(fn, body) {
    return fetch(SB + '/rest/v1/rpc/' + fn, {
      method: 'POST', cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) {
      return r.text().then(function (txt) {
        var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
        if (!r.ok) { var e = new Error((j && j.message) || 'error'); e.denied = j && j.code === '28000'; e.code = j && j.message; throw e; }
        return j;
      });
    }, function () { var e = new Error('net'); e.net = true; throw e; });
  }
  function media(body) {
    return fetch(SB + '/functions/v1/yom-media', {
      method: 'POST', cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'media'); e.denied = r.status === 401; throw e; } return j; }); });
  }
  function onDenied() { lsDel(LS_S); S.s = null; S.me = null; start(); }
  function fail(e, msg) {
    if (e && e.denied) { onDenied(); return; }
    toast(e && e.net ? 'אין חיבור כרגע. נסו שוב בעוד רגע.' : (msg || 'משהו השתבש. נסו שוב.'));
  }

  /* ---------- כתובות חתומות לקבצים ---------- */
  function needUrls(paths) {
    var now = Date.now();
    var miss = paths.filter(function (p) { var u = S.urls[p]; return p && !(u && u.exp > now); });
    if (!miss.length) return Promise.resolve();
    return media({ action: 'sign', s: S.s, paths: miss }).then(function (j) {
      var exp = Date.now() + 50 * 60 * 1000;
      Object.keys(j.urls || {}).forEach(function (p) { S.urls[p] = { url: j.urls[p], exp: exp }; });
    });
  }
  function urlOf(p) { var u = S.urls[p]; return u ? u.url : ''; }
  function fillImages() {
    $$('img[data-path]').forEach(function (img) {
      var u = urlOf(img.getAttribute('data-path'));
      if (u && img.getAttribute('src') !== u) { img.onload = function () { img.classList.add('on'); }; img.src = u; }
    });
  }
  function signVisible() {
    var paths = [];
    S.posts.forEach(function (p) { p.media.forEach(function (m) { if (m.kind === 'image') paths.push(m.thumb || m.path); }); });
    if (S.me && S.me.avatars) Object.keys(S.me.avatars).forEach(function (n) { var a = S.me.avatars[n]; if (a && a.indexOf('m/') === 0) paths.push(a); });
    if (!paths.length) return;
    needUrls(paths).then(fillImages).catch(function (e) { if (e.denied) onDenied(); });
  }

  /* ---------- כניסה ---------- */
  function readHash() {
    var h = location.hash, m;
    if ((m = /[#&]t=([A-Za-z0-9]{24,64})/.exec(h))) { S.t = m[1]; lsSet(LS_T, S.t); }
    var a = /[#&]a=([A-Za-z0-9]{16,64})/.exec(h);
    if (h) history.replaceState(null, '', location.pathname + location.search);
    return a ? a[1] : null;
  }

  function start() {
    var admin = readHash();
    if (admin) {
      rpc('yom_admin_join', { p_code: admin }).then(function (j) { S.s = j.s; lsSet(LS_S, S.s); boot(); })
        .catch(function (e) { if (e.net) { renderMsg('אין חיבור', 'בדקו את הקליטה ופתחו שוב את הקישור.'); } else renderMsg('הקישור לא בתוקף', 'בקשו מצוות המשלחת קישור עדכני.'); });
      return;
    }
    boot();
  }
  function boot() {
    if (S.s) {
      rpc('yom_me', { p_s: S.s }).then(function (me) {
        S.me = me; renderApp(); loadFeed(); signVisible();
        // מיד אחרי הכניסה הראשונה מציעים לבחור תמונה. אפשר לדלג
        if (S.justJoined && !me.avatar) { S.justJoined = false; avatarSheet(true); }
      })
        .catch(function (e) {
          if (e.denied) { lsDel(LS_S); S.s = null; boot(); return; }
          renderMsg('אין חיבור כרגע', 'היומן ייטען כשתחזור הקליטה.', true);
        });
      return;
    }
    if (S.t) return loadRoster();
    renderMsg('צריך קישור כדי להיכנס', 'כדי להיכנס ליומן צריך את הקישור שנשלח בקבוצת המשלחת.');
  }

  function renderMsg(title, text, retry) {
    $app.innerHTML = topBar(false) + '<main class="gate"><div class="sheet empty"><b>' + esc(title) + '</b>' + esc(text) +
      (retry ? '<div class="btns"><button class="btn primary" data-act="retry">לנסות שוב</button></div>' : '') + '</div></main>';
    var b = $('[data-act="retry"]'); if (b) b.onclick = boot;
  }

  var roster = [];
  function loadRoster() {
    rpc('yom_roster', { p_t: S.t }).then(function (list) { roster = list; renderGate(''); })
      .catch(function (e) {
        if (e.denied) { lsDel(LS_T); S.t = null; renderMsg('הקישור כבר לא בתוקף', 'בקשו מצוות המשלחת את הקישור העדכני ליומן.'); return; }
        renderMsg('אין חיבור כרגע', 'בדקו את הקליטה ונסו שוב.', true);
      });
  }
  function renderGate(q) {
    $app.innerHTML = topBar(false) + '<main class="gate">' +
      '<h2>מי אתם?</h2><p class="lead">בחרו את השם שלכם ברשימה. הטלפון יזכור אתכם, ובפעם הבאה תיכנסו ישר ליומן.</p>' +
      '<label class="search">' + ic('search') + '<span class="sr">חיפוש שם</span><input id="q" type="search" autocomplete="off" placeholder="חיפוש שם" value="' + esc(q) + '"></label>' +
      '<ul class="names sheet" id="names"></ul>' +
      '<p class="note">שם שכבר נבחר בטלפון אחר מסומן "כבר בשימוש". אם זה השם שלכם, פנו לניר והוא ישחרר אותו.</p></main>';
    var input = $('#q');
    input.oninput = function () { drawNames(input.value); };
    drawNames(q);
  }
  function drawNames(q) {
    q = (q || '').trim();
    var list = roster.filter(function (m) { return !q || m.name.indexOf(q) >= 0; });
    $('#names').innerHTML = list.length ? list.map(function (m) {
      return '<li><button class="name" data-id="' + m.id + '"' + (m.taken ? ' disabled' : '') + '>' + av(m.name) + '<span class="nm">' + esc(m.name) + '</span>' +
        (m.taken ? '<small>כבר בשימוש</small>' : '') + '</button></li>';
    }).join('') : '<li class="empty">אין שם כזה ברשימה. נסו לחפש רק את השם הפרטי.</li>';
    $$('#names .name').forEach(function (b) {
      b.onclick = function () {
        var m = roster.filter(function (x) { return String(x.id) === b.getAttribute('data-id'); })[0];
        confirmSheet('להיכנס בתור ' + m.name + '?', 'מעכשיו הפוסטים, התגובות והלייקים מהטלפון הזה יופיעו בשם הזה.', 'כן, זה אני', false, function (done) {
          rpc('yom_join', { p_t: S.t, p_member: m.id }).then(function (j) { done(); S.s = j.s; lsSet(LS_S, S.s); S.justJoined = true; boot(); })
            .catch(function (e) {
              done();
              if (e.code === 'taken') { toast('השם הזה כבר נבחר בטלפון אחר.'); loadRoster(); }
              else fail(e);
            });
        });
      };
    });
  }

  /* ---------- מסך ראשי ---------- */
  function topBar(withMe) {
    return '<header class="bar"><div class="bar-row"><h1>יומן המשלחת<small>' + ic('lock') + 'סגור למשתתפי המשלחת בלבד</small></h1>' +
      (withMe ? '<button class="me-btn" id="meBtn" aria-label="התפריט שלי, ' + esc(S.me.name) + '">' + av(S.me.name) + '</button>'
              : '<img class="logo" src="assets/advot-logo-white.png" alt="אדוות">') + '</div></header>';
  }
  function dayList() {
    var set = {}; TRIP.forEach(function (d) { set[d] = 1; }); (S.me.days || []).forEach(function (d) { set[d] = 1; });
    return Object.keys(set).sort();
  }
  function renderApp() {
    var have = {}; (S.me.days || []).forEach(function (d) { have[d] = 1; });
    var days = '<nav class="days" aria-label="סינון לפי יום"><div class="days-in">' +
      '<button class="day" data-day="" aria-pressed="' + (!S.day) + '"><b>הכול</b></button>' +
      dayList().map(function (d) {
        return '<button class="day" data-day="' + d + '" aria-pressed="' + (S.day === d) + '"><b>' + dayName(d) + '</b>' + dShort(d) + (have[d] ? '<span class="dot" aria-label="יש פוסטים"></span>' : '') + '</button>';
      }).join('') + '</div></nav>';
    $app.innerHTML = topBar(true) + days + '<main class="wrap"><div id="banner"></div><section id="composer" class="sheet composer" aria-label="פוסט חדש"></section><div id="feed" aria-live="polite"></div></main>';
    $('#meBtn').onclick = meMenu;
    $$('.day').forEach(function (b) {
      b.onclick = function () { S.day = b.getAttribute('data-day') || null; $$('.day').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); S.posts = []; drawFeed(); loadFeed(); };
    });
    var cur = $('.day[aria-pressed="true"]'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
    if (!S.draft) S.draft = newDraft('new');
    S.draft.el = $('#composer');
    drawComposer(); drawFeed();
  }

  function loadFeed(append) {
    if (S.loading) return; S.loading = true;
    var before = append && S.posts.length ? S.posts[S.posts.length - 1].at : null;
    if (!append && !S.posts.length) drawFeed(true);
    rpc('yom_feed', { p_s: S.s, p_day: S.day, p_before: before }).then(function (j) {
      S.loading = false; S.offline = false;
      S.posts = append ? S.posts.concat(j.posts) : j.posts; S.more = j.more;
      drawBanner(); drawFeed(); signVisible();
    }).catch(function (e) {
      S.loading = false;
      if (e.denied) return onDenied();
      S.offline = true; drawBanner(); drawFeed();
    });
  }
  function refresh() {
    if (!S.me || S.loading || document.hidden) return;
    var typing = $$('.c-new textarea').some(function (t) { return t.value.trim(); }) || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.c-new'));
    if (typing || Object.keys(S.editingC).length || document.querySelector('dialog[open]') || S.posts.length > 15) return;
    rpc('yom_me', { p_s: S.s }).then(function (me) {
      var daysChanged = JSON.stringify(me.days) !== JSON.stringify(S.me.days); S.me = me;
      if (daysChanged) { var y = window.scrollY; renderApp(); window.scrollTo(0, y); }
      loadFeed();
    }).catch(function (e) { if (e.denied) onDenied(); });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  setInterval(refresh, 60000);

  function drawBanner() {
    var b = $('#banner'); if (!b) return;
    b.innerHTML = S.offline ? '<div class="banner" role="status"><span>אין חיבור כרגע. הפוסטים שכבר נטענו נשארים על המסך.</span><button data-act="retry">לנסות שוב</button></div>' : '';
    var r = $('[data-act="retry"]', b); if (r) r.onclick = function () { loadFeed(); };
  }

  /* ---------- כתיבה ועריכה של פוסט (אותו עורך לשניהם) ---------- */
  var uidN = 0;
  function newDraft(mode, post) {
    var d = { mode: mode, uid: 'e' + (++uidN), text: '', keep: [], imgs: [], files: [], shareable: false, busy: false, err: '', progress: '' };
    if (post) { d.post = post; d.text = post.body; d.keep = post.media.slice(); d.shareable = post.shareable; }
    return d;
  }
  function hasContent(d) { return !!(d.text.trim() || d.keep.length || d.imgs.length || d.files.length); }
  // בעריכה: האם משהו השתנה לעומת הפוסט השמור
  function dirty(d) {
    if (d.mode !== 'edit') return hasContent(d);
    var ids = d.keep.map(function (m) { return m.id; }).join(','), was = d.post.media.map(function (m) { return m.id; }).join(',');
    return d.text.trim() !== d.post.body.trim() || d.shareable !== d.post.shareable || ids !== was || d.imgs.length > 0 || d.files.length > 0;
  }
  function canSave(d) { return !d.busy && hasContent(d) && d.imgs.every(function (x) { return x.ready; }) && (d.mode !== 'edit' || dirty(d)); }
  function imgCount(d) { return d.imgs.length + d.keep.filter(function (m) { return m.kind === 'image'; }).length; }
  function drawComposer() { if (S.draft.el) drawEditor(S.draft); }

  function drawEditor(d) {
    var c = d.el; if (!c) return;
    var edit = d.mode === 'edit', open = edit || hasContent(d);
    c.className = (edit ? 'ed-host composer editing' : 'sheet composer') + (open ? ' open' : '');
    var dis = d.busy ? ' disabled' : '';
    var att = d.keep.map(function (m, i) {
      if (m.kind === 'image') {
        return '<div class="att-img"><img data-path="' + esc(m.thumb || m.path) + '" alt=""><button class="x" data-rm-keep="' + i + '" aria-label="הסרת התמונה"' + dis + '>' + ic('close') + '</button></div>';
      }
      return '<div class="att-file">' + ic('file') + '<span><bdi>' + esc(m.name) + '</bdi> <small>' + fmtSize(m.size) + '</small></span><button class="x" data-rm-keep="' + i + '" aria-label="הסרת הקובץ"' + dis + '>' + ic('close') + '</button></div>';
    }).join('') + d.imgs.map(function (im, i) {
      return '<div class="att-img' + (im.ready ? '' : ' busy') + '">' + (im.preview ? '<img src="' + im.preview + '" alt="">' : '') +
        (im.ready ? '<span class="safe">' + ic('pin') + 'המיקום הוסר</span>' : '') +
        '<button class="x" data-rm-img="' + i + '" aria-label="הסרת התמונה"' + dis + '>' + ic('close') + '</button></div>';
    }).join('') + d.files.map(function (f, i) {
      return '<div class="att-file">' + ic('file') + '<span><bdi>' + esc(f.file.name) + '</bdi> <small>' + fmtSize(f.file.size) + '</small></span>' +
        '<button class="x" data-rm-file="' + i + '" aria-label="הסרת הקובץ"' + dis + '>' + ic('close') + '</button></div>';
    }).join('');
    var can = canSave(d);
    var goLabel = edit ? (d.busy ? 'בשמירה…' : 'שמירה') : (d.busy ? 'מתפרסם…' : 'פרסום');
    c.innerHTML =
      '<div class="composer-row">' + (edit ? '' : av(S.me.name)) + '<label class="sr" for="' + d.uid + '">טקסט הפוסט</label>' +
      '<textarea class="ed-txt" id="' + d.uid + '" rows="1" maxlength="6000" placeholder="' + (edit ? 'טקסט הפוסט' : 'מה תרצו לשתף מהיום?') + '"' + (d.busy ? ' disabled' : '') + '>' + esc(d.text) + '</textarea></div>' +
      (att ? '<div class="att">' + att + '</div>' : '') +
      (open ? '<label class="share-opt"><input type="checkbox" class="ed-share"' + (d.shareable ? ' checked' : '') + dis + '><span>אפשר לשתף את הפוסט הזה מחוץ לקבוצה, אחרי שניר יפתח את השיתוף בסוף המסע</span></label>' : '') +
      (d.err ? '<div class="err" role="alert">' + esc(d.err) + '</div>' : '') +
      (d.progress ? '<div class="progress" role="status">' + esc(d.progress) + '</div>' : '') +
      '<div class="tools">' +
      '<label class="tool">' + ic('image') + 'תמונות<input class="sr ed-img" type="file" accept="image/*" multiple' + (d.busy ? ' disabled' : '') + '></label>' +
      '<label class="tool">' + ic('clip') + 'קובץ<input class="sr ed-file" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" multiple' + (d.busy ? ' disabled' : '') + '></label>' +
      (edit ? '</div><div class="btns"><button class="btn ed-cancel"' + dis + '>ביטול</button><button class="btn primary ed-go"' + (can ? '' : ' disabled') + '>' + goLabel + '</button></div>'
            : '<button class="publish ed-go"' + (can ? '' : ' disabled') + '>' + goLabel + '</button></div>');
    var t = $('.ed-txt', c), go = $('.ed-go', c);
    autosize(t);
    t.oninput = function () {
      var was = open; d.text = t.value; d.err = ''; autosize(t);
      if (!edit && was !== hasContent(d)) { drawEditor(d); var n = $('.ed-txt', c); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
      else go.disabled = !canSave(d);
    };
    var sh = $('.ed-share', c); if (sh) sh.onchange = function () { d.shareable = sh.checked; go.disabled = !canSave(d); };
    $('.ed-img', c).onchange = function (e) { addImages(d, e.target.files); e.target.value = ''; };
    $('.ed-file', c).onchange = function (e) { addFiles(d, e.target.files); e.target.value = ''; };
    $$('[data-rm-keep]', c).forEach(function (b) { b.onclick = function () { d.keep.splice(+b.getAttribute('data-rm-keep'), 1); drawEditor(d); }; });
    $$('[data-rm-img]', c).forEach(function (b) { b.onclick = function () { var im = d.imgs.splice(+b.getAttribute('data-rm-img'), 1)[0]; if (im && im.preview) URL.revokeObjectURL(im.preview); drawEditor(d); }; });
    $$('[data-rm-file]', c).forEach(function (b) { b.onclick = function () { d.files.splice(+b.getAttribute('data-rm-file'), 1); drawEditor(d); }; });
    go.onclick = function () { submit(d); };
    var cn = $('.ed-cancel', c); if (cn) cn.onclick = function () { if (d.dlg) d.dlg.close(); };
    $$('img[data-path]', c).forEach(function (img) { var u = urlOf(img.getAttribute('data-path')); if (u) { img.src = u; img.classList.add('on'); } });
  }
  function autosize(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, window.innerHeight * 0.5) + 'px'; }

  function addImages(d, list) {
    d.err = '';
    var arr = Array.prototype.slice.call(list || []);
    if (imgCount(d) + arr.length > MAX_IMG) { d.err = 'אפשר לצרף עד ' + MAX_IMG + ' תמונות לפוסט אחד.'; arr = arr.slice(0, Math.max(0, MAX_IMG - imgCount(d))); }
    var items = arr.map(function (f) { var it = { src: f, ready: false }; d.imgs.push(it); return it; });
    drawEditor(d);
    // אחת אחרי השנייה, כדי לא להעמיס על הזיכרון של הטלפון
    items.reduce(function (p, it) {
      return p.then(function () {
        return cleanImage(it.src).then(function (r) {
          if (d.imgs.indexOf(it) < 0) return;
          it.full = r.full; it.thumb = r.thumb; it.w = r.w; it.h = r.h; it.ready = true; it.preview = URL.createObjectURL(r.thumb); it.src = null;
          drawEditor(d);
        }, function () {
          var i = d.imgs.indexOf(it); if (i >= 0) d.imgs.splice(i, 1);
          d.err = 'אחת התמונות לא נפתחה. נסו לבחור אותה שוב, או לצלם מסך שלה ולהעלות אותו.'; drawEditor(d);
        });
      });
    }, Promise.resolve());
  }
  function addFiles(d, list) {
    d.err = '';
    Array.prototype.slice.call(list || []).forEach(function (f) {
      var ext = extOf(f.name);
      if (FILE_EXT.indexOf(ext) < 0) { d.err = 'אפשר לצרף רק PDF, מצגות, מסמכי וורד וגיליונות אקסל.'; return; }
      if (f.size > MAX_FILE_MB * 1048576) { d.err = 'הקובץ ' + f.name + ' גדול מ-' + MAX_FILE_MB + ' MB. אפשר לשמור אותו כ-PDF ולנסות שוב.'; return; }
      d.files.push({ file: f, ext: ext });
    });
    drawEditor(d);
  }

  /* קידוד מחדש בקנבס: הקובץ שיוצא הוא JPEG נקי, בלי מיקום, בלי דגם הטלפון ובלי שעת הצילום המקורית */
  function decode(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return decodeImg(file); });
    }
    return decodeImg(file);
  }
  function decodeImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), img = new Image();
      img.onload = function () { res(img); setTimeout(function () { URL.revokeObjectURL(u); }, 1000); };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      img.src = u;
    });
  }
  function toJpeg(src, w, h, max, q) {
    var k = Math.min(1, max / Math.max(w, h)), cw = Math.round(w * k), ch = Math.round(h * k);
    var c = document.createElement('canvas'); c.width = cw; c.height = ch;
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); x.drawImage(src, 0, 0, cw, ch);
    return new Promise(function (res, rej) { c.toBlob(function (b) { c.width = c.height = 0; b ? res({ blob: b, w: cw, h: ch }) : rej(new Error('blob')); }, 'image/jpeg', q); });
  }
  function cleanImage(file) {
    return decode(file).then(function (bm) {
      var w = bm.width || bm.naturalWidth, h = bm.height || bm.naturalHeight;
      if (!w || !h) throw new Error('size');
      return toJpeg(bm, w, h, 2048, 0.85).then(function (full) {
        return toJpeg(bm, w, h, 1080, 0.8).then(function (thumb) {
          if (bm.close) bm.close();
          return { full: full.blob, thumb: thumb.blob, w: full.w, h: full.h };
        });
      });
    });
  }

  function submit(d) {
    if (d.busy) return;
    var edit = d.mode === 'edit';
    d.busy = true; d.err = ''; d.progress = ''; drawEditor(d);
    var req = [];
    d.imgs.forEach(function () { req.push({ ext: 'jpg' }, { ext: 'jpg' }); });
    d.files.forEach(function (f) { req.push({ ext: f.ext }); });
    var total = d.imgs.length + d.files.length, nImgUp = d.imgs.length * 2;
    var slots = req.length ? media({ action: 'upload', s: S.s, files: req }) : Promise.resolve({ files: [] });
    slots.then(function (j) {
      var up = [], k = 0, mediaList = [];
      d.imgs.forEach(function (im) {
        var a = j.files[k++], b = j.files[k++];
        up.push({ slot: a, blob: im.full }, { slot: b, blob: im.thumb });
        mediaList.push({ kind: 'image', path: a.path, thumb: b.path, w: im.w, h: im.h, size: im.full.size, mime: 'image/jpeg', name: '' });
      });
      d.files.forEach(function (f) {
        var a = j.files[k++]; up.push({ slot: a, blob: f.file });
        mediaList.push({ kind: 'file', path: a.path, name: f.file.name, size: f.file.size, mime: a.mime });
      });
      var done = 0;
      if (total) { d.progress = 'מעלים את הקבצים, ' + total + ' בסך הכול'; drawEditor(d); }
      var seq = up.reduce(function (p, u, i) {
        return p.then(function () {
          return fetch(SB + '/storage/v1/object/upload/sign/yom-media/' + u.slot.path + '?token=' + encodeURIComponent(u.slot.token), {
            method: 'PUT', headers: { 'Content-Type': u.slot.mime, 'x-upsert': 'false' }, body: u.blob
          }).then(function (r) {
            if (!r.ok) throw new Error('upload');
            // תמונה נספרת אחרי ששני הגדלים שלה עלו
            if (i >= nImgUp || i % 2 === 1) { done++; d.progress = 'מעלים ' + done + ' מתוך ' + total; var pr = $('.progress', d.el); if (pr) pr.textContent = d.progress; }
          });
        });
      }, Promise.resolve());
      return seq.then(function () {
        if (edit) return rpc('yom_edit_post', { p_s: S.s, p_id: d.post.id, p_body: d.text, p_keep: d.keep.map(function (m) { return m.id; }), p_add: mediaList, p_shareable: d.shareable });
        return rpc('yom_post', { p_s: S.s, p_body: d.text, p_media: mediaList, p_shareable: d.shareable });
      });
    }).then(function (post) {
      d.imgs.forEach(function (im) { if (im.preview) URL.revokeObjectURL(im.preview); });
      if (edit) {
        d.busy = false; if (d.dlg) d.dlg.close();
        replacePost(post); signVisible(); toast('השינויים נשמרו');
        return;
      }
      S.draft = newDraft('new');
      if (S.me.days.indexOf(post.day) < 0) { S.me.days = S.me.days.concat([post.day]).sort(); }
      if (!S.day || S.day === post.day) S.posts.unshift(post);
      renderAppKeep(); signVisible(); toast('הפוסט פורסם ביומן');
    }).catch(function (e) {
      if (e.denied) { if (d.dlg) d.dlg.close(); return onDenied(); }
      d.busy = false; d.progress = '';
      var net = e.net || e.message === 'upload' || e.message === 'Failed to fetch';
      d.err = edit ? (net ? 'השינויים לא נשמרו כי החיבור נפל. אפשר לנסות שוב.' : 'השינויים לא נשמרו. נסו שוב.')
                   : (net ? 'הפרסום לא הושלם כי החיבור נפל. הטקסט והקבצים נשמרו כאן, ואפשר לנסות שוב.' : 'הפרסום לא הושלם. נסו שוב.');
      drawEditor(d);
    });
  }
  function renderAppKeep() { renderApp(); fillImages(); }

  function editPost(p) {
    var d = newDraft('edit', p);
    d.dlg = sheet('<h3>עריכת הפוסט</h3><div class="ed-host"></div>', function (dlg) { d.el = $('.ed-host', dlg); });
    // סגירה בהקשה מחוץ לגיליון או ב-Esc: לא בזמן שמירה, ולא בלי לשאול כשיש שינויים
    d.dlg.guard = function () {
      if (d.busy) return true;
      if (!dirty(d)) return false;
      confirmSheet('לבטל את השינויים?', 'מה ששיניתם בפוסט לא יישמר.', 'ביטול השינויים', true, function (done) { done(); d.dlg.close(); }, 'המשך עריכה');
      return true;
    };
    drawEditor(d);
    var paths = p.media.filter(function (m) { return m.kind === 'image'; }).map(function (m) { return m.thumb || m.path; });
    // ממלאים את התמונות במקום, בלי לבנות את העורך מחדש, כדי לא לאבד את הסמן והמקלדת
    if (paths.length) needUrls(paths).then(function () {
      $$('img[data-path]', d.el).forEach(function (img) { var u = urlOf(img.getAttribute('data-path')); if (u && !img.getAttribute('src')) { img.src = u; img.classList.add('on'); } });
    }).catch(function () {});
    var t = $('.ed-txt', d.el); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
  }

  /* ---------- פיד ---------- */
  function drawFeed(skeleton) {
    var f = $('#feed'); if (!f) return;
    if (skeleton || (S.loading && !S.posts.length)) { f.innerHTML = '<div class="sheet skel"></div><div class="sheet skel"></div>'; return; }
    if (!S.posts.length) {
      f.innerHTML = '<div class="sheet empty"><b>' + (S.day ? 'עוד אין פוסטים מיום ' + dayName(S.day) + ' ' + dShort(S.day) : 'היומן עוד ריק') + '</b>' +
        'רק חברי המשלחת יראו את מה שתכתבו כאן. אפשר להתחיל במחשבה קצרה מהיום, בתמונה או במצגת ששווה לשמור.</div>';
      return;
    }
    // בתצוגת "הכול" כל יום במסע מקבל כותרת משלו, כך שהיומן נקרא יום אחרי יום
    var last = null;
    f.innerHTML = S.posts.map(function (p) {
      var head = '';
      if (!S.day && p.day !== last) { head = '<h2 class="dayhead">יום ' + dayName(p.day) + ', ' + dShort(p.day) + '</h2>'; last = p.day; }
      return head + postHtml(p);
    }).join('') + (S.more ? '<button class="loadmore" id="more">פוסטים קודמים</button>' : '');
    var m = $('#more'); if (m) m.onclick = function () { m.disabled = true; m.textContent = 'טוען…'; loadFeed(true); };
    bindPosts(f); fillImages();
  }

  function postHtml(p) {
    var imgs = p.media.filter(function (m) { return m.kind === 'image'; });
    var files = p.media.filter(function (m) { return m.kind === 'file'; });
    var canMenu = p.mine || S.me.admin;
    var long = p.body.length > 520 || (p.body.match(/\n/g) || []).length > 8;
    var h = '<article class="sheet post" data-id="' + p.id + '"><div class="post-head">' + av(p.author) +
      '<div class="who"><b>' + esc(p.author) + '</b><time datetime="' + esc(p.at) + '">' + when(p.at) + (p.edited ? ' · נערך' : '') + '</time></div>' +
      (canMenu ? '<button class="more" data-menu aria-label="אפשרויות לפוסט">' + ic('dots') + '</button>' : '') + '</div>';
    if (p.body) h += '<div class="body' + (long && !S.expanded[p.id] ? ' clip' : '') + '">' + linkify(p.body) + '</div>' + (long && !S.expanded[p.id] ? '<button class="readmore" data-readmore>להמשך הקריאה</button>' : '');
    if (p.mine && p.shareable) h += '<span class="tag-share">' + ic('globe') + 'אישרתם שיתוף אחרי המסע</span>';
    if (imgs.length) {
      var n = imgs.length, shown = imgs.slice(0, n > 4 ? 4 : n), cls = 'g' + Math.min(n, 4);
      h += '<div class="grid ' + cls + '">' + shown.map(function (m, i) {
        var style = n === 1 && m.w && m.h ? ' data-ar="' + Math.max(m.w / m.h, 0.8).toFixed(3) + '"' : '';
        return '<button data-view="' + i + '" aria-label="פתיחת תמונה ' + (i + 1) + ' מתוך ' + n + '"' + style + '><img data-path="' + esc(m.thumb || m.path) + '" alt="">' +
          (i === 3 && n > 4 ? '<span class="plus">+' + (n - 4) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    }
    if (files.length) {
      h += '<div class="files">' + files.map(function (m, i) {
        return '<button class="file" data-file="' + i + '"><span class="ic">' + ic('file') + '</span><span class="nm"><b>' + esc(m.name) + '</b><small>' +
          esc(extOf(m.name).toUpperCase()) + ' · ' + fmtSize(m.size) + '</small></span>' + ic('download') + '</button>';
      }).join('') + '</div>';
    }
    var nc = p.comments.length;
    if (p.likes || nc) {
      h += '<div class="stats">' + (p.likes ? '<button data-likers>' + (p.likes === 1 ? 'לייק אחד' : p.likes + ' לייקים') + '</button>' : '<span></span>') +
        (nc ? '<button data-toggle-c>' + (nc === 1 ? 'תגובה אחת' : nc + ' תגובות') + '</button>' : '') + '</div>';
    }
    var shareOk = S.me.share_open && p.shareable;
    h += '<div class="acts"><button class="act' + (p.liked ? ' liked' : '') + '" data-like aria-pressed="' + p.liked + '">' + ic('heart') + 'אהבתי</button>' +
      '<button class="act" data-toggle-c aria-expanded="' + !!S.open[p.id] + '">' + ic('comment') + 'תגובה</button>' +
      (shareOk ? '<button class="act" data-share>' + ic('share') + 'שיתוף</button>' : '') + '</div>';
    if (S.open[p.id] || (nc && nc <= 2)) h += commentsHtml(p);
    return h + '</article>';
  }
  function commentsHtml(p) {
    var list = p.comments, all = S.showAll[p.id] || list.length <= 3;
    var shown = all ? list : list.slice(-2);
    return '<div class="comments">' +
      (!all ? '<button class="showall" data-showall>הצגת כל ' + list.length + ' התגובות</button>' : '') +
      shown.map(function (c) {
        if (S.editingC[c.id] != null) {
          return '<div class="c">' + av(c.author) + '<div class="c-edit"><label class="sr" for="ce' + c.id + '">עריכת התגובה</label>' +
            '<textarea id="ce' + c.id + '" rows="1" maxlength="2000">' + esc(S.editingC[c.id]) + '</textarea>' +
            '<div class="c-meta"><button class="c-save" data-savec="' + c.id + '">שמירה</button><button data-cancelc="' + c.id + '">ביטול</button></div></div></div>';
        }
        return '<div class="c">' + av(c.author) + '<div><div class="c-b"><b>' + esc(c.author) + '</b><p>' + linkify(c.body) + '</p></div>' +
          '<div class="c-meta"><time datetime="' + esc(c.at) + '">' + when(c.at) + (c.edited ? ' · נערכה' : '') + '</time>' +
          (c.mine ? '<button data-editc="' + c.id + '">עריכה</button>' : '') +
          (c.mine || S.me.admin ? '<button data-delc="' + c.id + '">מחיקה</button>' : '') + '</div></div></div>';
      }).join('') +
      '<div class="c-new"><label class="sr" for="c' + p.id + '">תגובה לפוסט של ' + esc(p.author) + '</label><textarea id="c' + p.id + '" rows="1" maxlength="2000" placeholder="כתיבת תגובה"></textarea>' +
      '<button class="send" data-send disabled aria-label="שליחת התגובה">' + ic('send') + '</button></div></div>';
  }
  function findPost(id) { return S.posts.filter(function (p) { return String(p.id) === String(id); })[0]; }
  function replacePost(p, focusComment) {
    var i = S.posts.findIndex(function (x) { return x.id === p.id; }); if (i < 0) return;
    S.posts[i] = p;
    var el = $('.post[data-id="' + p.id + '"]'); if (!el) return;
    var tmp = document.createElement('div'); tmp.innerHTML = postHtml(p);
    var neu = tmp.firstChild; el.parentNode.replaceChild(neu, el); bindPosts(neu.parentNode, neu); fillImages();
    if (focusComment) { var t = $('textarea', neu); if (t) t.focus(); }
  }

  function bindPosts(root, only) {
    $$(only ? '.post[data-id="' + only.getAttribute('data-id') + '"]' : '.post', root).forEach(function (el) {
      var id = el.getAttribute('data-id'), p = findPost(id); if (!p) return;
      $$('[data-like]', el).forEach(function (b) {
        b.onclick = function () {
          var on = !p.liked; p.liked = on; p.likes += on ? 1 : -1;
          if (on) p.likers = (p.likers || []).concat([S.me.name]); else p.likers = (p.likers || []).filter(function (n) { return n !== S.me.name; });
          replacePost(p);
          rpc('yom_like', { p_s: S.s, p_post: p.id, p_on: on }).then(function (np) { replacePost(np); }).catch(function (e) { p.liked = !on; p.likes += on ? -1 : 1; replacePost(p); fail(e); });
        };
      });
      $$('[data-toggle-c]', el).forEach(function (b) {
        b.onclick = function () {
          S.open[p.id] = !S.open[p.id] || !$('.comments', el);
          // סגירת התגובות מבטלת עריכה פתוחה בהן, כדי שהרענון ברקע לא ייתקע
          if (!S.open[p.id]) p.comments.forEach(function (c) { delete S.editingC[c.id]; });
          replacePost(p, S.open[p.id]);
        };
      });
      var sa = $('[data-showall]', el); if (sa) sa.onclick = function () { S.showAll[p.id] = true; S.open[p.id] = true; replacePost(p); };
      var rm = $('[data-readmore]', el); if (rm) rm.onclick = function () { S.expanded[p.id] = true; replacePost(p); };
      var lk = $('[data-likers]', el); if (lk) lk.onclick = function () { likersSheet(p); };
      var mn = $('[data-menu]', el); if (mn) mn.onclick = function () { postMenu(p); };
      var sh = $('[data-share]', el); if (sh) sh.onclick = function () { sharePost(p, sh); };
      $$('[data-ar]', el).forEach(function (b) { b.style.aspectRatio = b.getAttribute('data-ar'); });
      $$('[data-view]', el).forEach(function (b) { b.onclick = function () { viewer(p, +b.getAttribute('data-view')); }; });
      $$('[data-file]', el).forEach(function (b) { b.onclick = function () { openFile(p.media.filter(function (m) { return m.kind === 'file'; })[+b.getAttribute('data-file')], b); }; });
      $$('[data-editc]', el).forEach(function (b) {
        b.onclick = function () { var cid = b.getAttribute('data-editc'); S.editingC[cid] = (p.comments.filter(function (x) { return String(x.id) === cid; })[0] || {}).body || ''; S.open[p.id] = true; replacePost(p); var t = $('#ce' + b.getAttribute('data-editc')); if (t) { autosizeC(t); t.focus(); t.setSelectionRange(t.value.length, t.value.length); } };
      });
      $$('[data-cancelc]', el).forEach(function (b) { b.onclick = function () { delete S.editingC[b.getAttribute('data-cancelc')]; replacePost(p); }; });
      $$('[data-savec]', el).forEach(function (b) {
        var cid = b.getAttribute('data-savec'), t = $('#ce' + cid);
        t.oninput = function () { S.editingC[cid] = t.value; b.disabled = !t.value.trim(); autosizeC(t); };
        b.onclick = function () {
          var txt = t.value.trim(); if (!txt) return; b.disabled = true; t.disabled = true;
          rpc('yom_edit_comment', { p_s: S.s, p_id: +cid, p_body: txt }).then(function (np) { delete S.editingC[cid]; replacePost(np); })
            .catch(function (e) { b.disabled = false; t.disabled = false; fail(e, 'התגובה לא נשמרה. נסו שוב.'); });
        };
      });
      $$('[data-delc]', el).forEach(function (b) {
        b.onclick = function () {
          confirmSheet('למחוק את התגובה?', 'התגובה תיעלם מהיומן לכולם.', 'מחיקה', true, function (done) {
            rpc('yom_delete_comment', { p_s: S.s, p_id: +b.getAttribute('data-delc') }).then(function (np) { done(); replacePost(np); }).catch(function (e) { done(); fail(e); });
          });
        };
      });
      var ta = $('.c-new textarea', el), send = $('[data-send]', el);
      if (ta) {
        ta.oninput = function () { send.disabled = !ta.value.trim(); autosizeC(ta); };
        ta.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(hover:hover)').matches) { e.preventDefault(); if (!send.disabled) send.click(); } };
        send.onclick = function () {
          var txt = ta.value.trim(); if (!txt) return; send.disabled = true; ta.disabled = true;
          rpc('yom_comment', { p_s: S.s, p_post: p.id, p_body: txt }).then(function (np) { S.open[p.id] = true; replacePost(np, true); })
            .catch(function (e) { ta.disabled = false; send.disabled = false; fail(e, 'התגובה לא נשלחה. נסו שוב.'); });
        };
      }
    });
  }
  function autosizeC(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, 140) + 'px'; }

  function openFile(m, btn) {
    // חלון נפתח מיד, כדי שספארי לא יחסום אותו, והכתובת החתומה נכנסת אליו כשהיא מגיעה
    var w = window.open('', '_blank');
    needUrls([m.path]).then(function () {
      var u = urlOf(m.path); if (!u) throw new Error('nourl');
      if (w) { w.opener = null; w.location.href = u; } else location.href = u;
    }).catch(function (e) { if (w) w.close(); fail(e, 'הקובץ לא נפתח. נסו שוב.'); });
  }

  /* ---------- גיליונות ---------- */
  function sheet(html, onOpen) {
    var d = document.createElement('dialog'); d.className = 'sheetdlg';
    d.innerHTML = '<div class="in"><div class="grab" aria-hidden="true"></div>' + html + '</div>';
    document.body.appendChild(d);
    d.addEventListener('close', function () { d.remove(); });
    d.addEventListener('click', function (e) { if (e.target === d && !(d.guard && d.guard())) d.close(); });
    d.addEventListener('cancel', function (e) { if (d.guard && d.guard()) e.preventDefault(); });
    d.showModal(); if (onOpen) onOpen(d);
    return d;
  }
  function confirmSheet(title, text, okLabel, danger, action, noLabel) {
    sheet('<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p><div class="btns"><button class="btn" data-no>' + esc(noLabel || 'ביטול') + '</button><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-ok>' + esc(okLabel) + '</button></div>', function (d) {
      $('[data-no]', d).onclick = function () { d.close(); };
      var ok = $('[data-ok]', d);
      ok.onclick = function () { ok.disabled = true; $('[data-no]', d).disabled = true; action(function () { if (d.open) d.close(); }); };
    });
  }
  function likersSheet(p) {
    sheet('<h3>' + (p.likes === 1 ? 'לייק אחד' : p.likes + ' לייקים') + '</h3><ul class="likers">' + (p.likers || []).map(function (n) { return '<li>' + av(n) + esc(n) + '</li>'; }).join('') +
      '</ul><div class="btns"><button class="btn" data-no>סגירה</button></div>', function (d) { $('[data-no]', d).onclick = function () { d.close(); }; });
  }
  function postMenu(p) {
    var items = '';
    if (p.mine) items += '<li><button data-edit>' + ic('pen') + 'עריכת הפוסט</button></li>';
    if (p.mine) items += '<li><button data-sh>' + ic('globe') + (p.shareable ? 'ביטול האישור לשתף אחרי המסע' : 'אישור לשתף את הפוסט אחרי המסע') + '</button></li>';
    items += '<li><button class="danger" data-del>' + ic('trash') + 'מחיקת הפוסט' + (p.mine ? '' : ' (ניהול)') + '</button></li>';
    sheet('<ul class="menu">' + items + '</ul>', function (d) {
      var ed = $('[data-edit]', d); if (ed) ed.onclick = function () { d.close(); editPost(p); };
      var sh = $('[data-sh]', d);
      if (sh) sh.onclick = function () {
        d.close(); var on = !p.shareable;
        rpc('yom_set_shareable', { p_s: S.s, p_id: p.id, p_on: on }).then(function () { p.shareable = on; replacePost(p); toast(on ? 'אפשר יהיה לשתף את הפוסט אחרי המסע, כשניר יפתח את האפשרות' : 'הפוסט יישאר רק בתוך הקבוצה'); }).catch(function (e) { fail(e); });
      };
      $('[data-del]', d).onclick = function () {
        d.close();
        confirmSheet('למחוק את הפוסט?', 'הפוסט, התמונות והתגובות שלו ייעלמו מהיומן לכולם.', 'מחיקה', true, function (done) {
          rpc('yom_delete_post', { p_s: S.s, p_id: p.id }).then(function () { done(); S.posts = S.posts.filter(function (x) { return x.id !== p.id; }); drawFeed(); toast('הפוסט נמחק'); })
            .catch(function (e) { done(); fail(e); });
        });
      };
    });
  }
  /* ---------- תמונת פרופיל: דמות מהמשחק, תמונה אישית, או רק האות ---------- */
  function squareJpeg(file) {
    // חיתוך ריבוע ממרכז התמונה וקידוד מחדש: גם כאן לא נשאר מיקום או כל נתון צילום אחר
    return decode(file).then(function (bm) {
      var w = bm.width || bm.naturalWidth, h = bm.height || bm.naturalHeight, s = Math.min(w, h), out = Math.min(480, s);
      if (!s) throw new Error('size');
      var c = document.createElement('canvas'); c.width = c.height = out;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, out, out);
      // בתמונה לאורך הפנים בדרך כלל בחלק העליון, ולכן החיתוך נוטה למעלה
      x.drawImage(bm, (w - s) / 2, h > w ? (h - s) * 0.25 : (h - s) / 2, s, s, 0, 0, out, out);
      if (bm.close) bm.close();
      return new Promise(function (res, rej) { c.toBlob(function (b) { c.width = c.height = 0; b ? res(b) : rej(new Error('blob')); }, 'image/jpeg', 0.85); });
    });
  }
  function applyAvatar(a) {
    S.me.avatar = a; S.me.avatars = S.me.avatars || {};
    if (a) S.me.avatars[S.me.name] = a; else delete S.me.avatars[S.me.name];
    var y = window.scrollY; renderApp(); window.scrollTo(0, y); signVisible();
  }
  function avatarSheet(first) {
    var cur = S.me.avatar || '';
    var tiles = CHARS.map(function (c) {
      var v = 'q:' + c[0];
      return '<li><button class="pick" data-av="' + v + '" aria-pressed="' + (cur === v) + '"><span class="pick-img q"><img src="assets/av/' + c[0] + '.webp" alt="" loading="lazy" decoding="async"></span><span class="pick-nm">' + esc(c[1]) + '</span></button></li>';
    }).join('');
    var mine = cur.indexOf('m/') === 0;
    var d = sheet('<h3>' + (first ? 'רוצים לבחור תמונה?' : 'תמונת פרופיל') + '</h3>' +
      '<p>התמונה תופיע ליד הפוסטים והתגובות שלכם. בחרו דמות מהמשחק או תמונה שלכם, ואפשר להחליף מתי שרוצים.</p>' +
      '<div class="pick-own">' +
      '<label class="btn pick-up">' + ic('image') + 'תמונה שלי<input class="sr" type="file" accept="image/*" data-up></label>' +
      '<button class="btn" data-none' + (!cur ? ' aria-pressed="true"' : '') + '><span class="av ' + avc(S.me.name) + '" aria-hidden="true">' + initial(S.me.name) + '</span>רק האות</button></div>' +
      '<div class="pick-prev" hidden><span class="pick-frame"><img alt="התמונה שלכם כפי שתוצג ביומן"></span>' +
      '<div class="pick-prev-b"><b>כך התמונה תיראה ביומן</b><div class="btns"><label class="btn pick-up">תמונה אחרת<input class="sr" type="file" accept="image/*" data-up></label><button class="btn primary" data-use>שימוש בתמונה</button></div></div></div>' +
      (mine ? '<p class="pick-cur">' + av(S.me.name) + 'כרגע מוצגת התמונה שלכם</p>' : '') +
      '<ul class="picks" aria-label="דמויות מהמשחק">' + tiles + '</ul>' +
      '<div class="pick-foot"><div class="pick-status" role="status"></div><div class="btns"><button class="btn" data-no>' + (first ? 'אחר כך' : 'סגירה') + '</button></div></div>');
    if (mine) needUrls([cur]).then(function () { $$('img[data-path]', d).forEach(function (i) { i.src = urlOf(i.getAttribute('data-path')); }); }).catch(function () {});
    var sel = $('.pick[aria-pressed="true"]', d); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'center' });
    var status = $('.pick-status', d), prev = $('.pick-prev', d), blob = null, prevUrl = null;
    function busy(on, msg, btn) {
      $$('button, input', d).forEach(function (b) { if (!b.hasAttribute('data-no')) b.disabled = on; });
      $$('[aria-busy]', d).forEach(function (b) { b.setAttribute('aria-busy', 'false'); });
      if (on && btn) btn.setAttribute('aria-busy', 'true');
      status.className = 'pick-status'; status.textContent = msg || '';
    }
    function err(msg) { busy(false, ''); status.className = 'pick-status err'; status.textContent = msg; }
    function save(a, okMsg, btn) {
      busy(true, 'בשמירה…', btn);
      return rpc('yom_set_avatar', { p_s: S.s, p_avatar: a }).then(function () { if (prevUrl) URL.revokeObjectURL(prevUrl); applyAvatar(a); d.close(); toast(okMsg); })
        .catch(function (e) {
          if (e && e.denied) { d.close(); return onDenied(); }
          err(e && e.net ? 'אין חיבור כרגע. נסו שוב בעוד רגע.' : 'התמונה לא נשמרה. נסו שוב.');
        });
    }
    $('[data-no]', d).onclick = function () { if (prevUrl) URL.revokeObjectURL(prevUrl); d.close(); };
    $$('[data-av]', d).forEach(function (b) { b.onclick = function () { save(b.getAttribute('data-av'), 'הדמות נבחרה', b); }; });
    $('[data-none]', d).onclick = function () { save(null, 'מעכשיו תוצג רק האות הראשונה של השם', this); };
    // תמונה אישית: קודם תצוגה מקדימה של החיתוך, ורק אחרי אישור היא עולה ומוצגת לכולם
    $$('[data-up]', d).forEach(function (inp) {
      inp.onchange = function (e) {
        var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
        busy(true, 'מכינים את התמונה…');
        squareJpeg(f).then(function (b) {
          blob = b; if (prevUrl) URL.revokeObjectURL(prevUrl); prevUrl = URL.createObjectURL(b);
          $('img', prev).src = prevUrl; prev.hidden = false; busy(false, '');
          prev.scrollIntoView({ block: 'nearest' }); $('[data-use]', d).focus();
        }).catch(function () { err('התמונה הזו לא נפתחה. נסו תמונה אחרת.'); });
      };
    });
    $('[data-use]', d).onclick = function () {
      var btn = this; if (!blob) return;
      busy(true, 'מעלים את התמונה…', btn);
      media({ action: 'upload', s: S.s, files: [{ ext: 'jpg' }] }).then(function (j) {
        var slot = j.files[0];
        return fetch(SB + '/storage/v1/object/upload/sign/yom-media/' + slot.path + '?token=' + encodeURIComponent(slot.token), {
          method: 'PUT', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false' }, body: blob
        }).then(function (r) { if (!r.ok) throw new Error('upload'); return slot.path; });
      }).then(function (path) { return save(path, 'התמונה שלכם נשמרה', btn); })
        .catch(function (e) {
          if (e && e.denied) { d.close(); return onDenied(); }
          err('ההעלאה לא הצליחה. בדקו את החיבור ונסו שוב.');
        });
    };
  }

  function meMenu() {
    var items = '<li><button data-avatar>' + ic('image') + 'תמונת פרופיל</button></li>' +
      (S.me.admin ? '<li><button data-admin>' + ic('users') + 'ניהול היומן</button></li>' : '') +
      '<li><button data-out>' + ic('out') + 'יציאה מהיומן בטלפון הזה</button></li>';
    sheet('<h3>' + esc(S.me.name) + '</h3><p>אתם מחוברים ליומן בטלפון הזה.</p><ul class="menu">' + items + '</ul>', function (d) {
      var a = $('[data-admin]', d); if (a) a.onclick = function () { d.close(); adminSheet(); };
      $('[data-avatar]', d).onclick = function () { d.close(); avatarSheet(false); };
      $('[data-out]', d).onclick = function () {
        d.close();
        confirmSheet('לצאת מהיומן בטלפון הזה?', 'השם שלכם ישתחרר, ותוכלו להיכנס שוב מהקישור של המשלחת, מהטלפון הזה או מטלפון אחר. הפוסטים שכתבתם נשארים ביומן.', 'יציאה', false, function (done) {
          rpc('yom_logout', { p_s: S.s }).catch(function () {}).then(function () { done(); lsDel(LS_S); S.s = null; S.me = null; S.posts = []; boot(); });
        });
      };
    });
  }
  function adminSheet() {
    var d = sheet('<h3>ניהול היומן</h3><div id="adm"><p>טוען…</p></div>');
    function draw(j) {
      var joined = j.members.filter(function (m) { return m.joined && !m.admin; }).length, total = j.members.filter(function (m) { return !m.admin; }).length;
      $('#adm', d).innerHTML =
        '<label class="switch"><input type="checkbox" id="shOpen"' + (j.share_open ? ' checked' : '') + '><span><b>שיתוף מחוץ לקבוצה</b>' +
        (j.share_open ? 'פתוח. בפוסטים שהכותבים אישרו מופיע כפתור שיתוף.' : 'סגור. אף אחד לא רואה כפתור שיתוף. כדאי לפתוח רק אחרי החזרה ארצה.') + '</span></label>' +
        '<p>' + joined + ' מתוך ' + total + ' משתתפים כבר נכנסו.</p>' +
        '<ul class="mem">' + j.members.map(function (m) {
          return '<li><span class="pill-in' + (m.joined ? ' on' : '') + '" aria-hidden="true"></span><span class="st">' + esc(m.name) + (m.admin ? ' (ניהול)' : '') +
            '<small>' + (m.joined ? 'נבחר' + (m.last_seen ? ' · פעילות אחרונה ' + when(m.last_seen) : '') : 'עוד לא נבחר') + (m.posts ? ' · ' + (m.posts === 1 ? 'פוסט אחד' : m.posts + ' פוסטים') : '') + '</small></span>' +
            (m.joined && !m.admin ? '<button class="rel" data-rel="' + m.id + '" data-name="' + esc(m.name) + '">שחרור</button>' : '') + '</li>';
        }).join('') + '</ul><div class="btns"><button class="btn" data-no>סגירה</button></div>';
      $('[data-no]', d).onclick = function () { d.close(); };
      $('#shOpen', d).onchange = function (e) {
        var on = e.target.checked;
        rpc('yom_admin', { p_s: S.s, p_action: 'share_open', p_arg: { on: on } }).then(function (j2) { S.me.share_open = j2.share_open; draw(j2); drawFeed(); })
          .catch(function (er) { e.target.checked = !on; fail(er); });
      };
      $$('[data-rel]', d).forEach(function (b) {
        b.onclick = function () {
          if (b.getAttribute('data-sure') !== '1') { b.setAttribute('data-sure', '1'); b.textContent = 'לשחרר?'; return; }
          b.disabled = true;
          rpc('yom_admin', { p_s: S.s, p_action: 'release', p_arg: { id: +b.getAttribute('data-rel') } }).then(function (j2) { draw(j2); toast('השם של ' + b.getAttribute('data-name') + ' שוחרר. אפשר להיכנס איתו מחדש מהקישור.'); })
            .catch(function (er) { b.disabled = false; fail(er); });
        };
      });
    }
    rpc('yom_admin', { p_s: S.s, p_action: 'members', p_arg: {} }).then(draw).catch(function (e) { d.close(); fail(e); });
  }

  /* ---------- צפייה בתמונות ---------- */
  function viewer(p, idx) {
    var imgs = p.media.filter(function (m) { return m.kind === 'image'; });
    var shareOk = S.me.share_open && p.shareable;
    var d = document.createElement('dialog'); d.className = 'viewer'; d.setAttribute('aria-label', 'תמונות מהפוסט של ' + p.author);
    d.innerHTML = '<div class="stage"><img alt=""><span class="loading" hidden>טוען…</span></div>' +
      '<div class="vbar"><button class="vb" data-close aria-label="סגירה">' + ic('close') + '</button><span aria-live="polite"></span>' +
      (shareOk ? '<button class="vb" data-vshare aria-label="שיתוף התמונה">' + ic('share') + '</button>' : '<span class="vspacer"></span>') + '</div>' +
      '<button class="vb vnav vprev" data-prev aria-label="התמונה הקודמת">' + ic('right') + '</button><button class="vb vnav vnext" data-next aria-label="התמונה הבאה">' + ic('left') + '</button>';
    document.body.appendChild(d);
    var img = $('img', d), cnt = $('.vbar span', d), ld = $('.loading', d);
    function show(i) {
      idx = (i + imgs.length) % imgs.length; var m = imgs[idx];
      cnt.textContent = imgs.length > 1 ? (idx + 1) + ' מתוך ' + imgs.length : '';
      var low = urlOf(m.thumb || m.path); img.src = low || ''; ld.hidden = !!low;
      needUrls([m.path]).then(function () { if (imgs[idx] === m) { img.src = urlOf(m.path); ld.hidden = true; } }).catch(function () {});
      $('[data-prev]', d).hidden = $('[data-next]', d).hidden = imgs.length < 2;
    }
    $('[data-close]', d).onclick = function () { d.close(); };
    $('[data-prev]', d).onclick = function () { show(idx - 1); };
    $('[data-next]', d).onclick = function () { show(idx + 1); };
    var vs = $('[data-vshare]', d); if (vs) vs.onclick = function () { shareImages(p, [imgs[idx]], vs); };
    d.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx + 1); if (e.key === 'ArrowRight') show(idx - 1); });
    var x0 = null;
    d.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    d.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50 && imgs.length > 1) show(dx < 0 ? idx + 1 : idx - 1); });
    d.addEventListener('close', function () { d.remove(); });
    d.showModal(); show(idx);
  }

  /* ---------- שיתוף החוצה (רק כשניר פתח, ורק בפוסט שהכותב אישר) ---------- */
  function sharePost(p, btn) { shareImages(p, p.media.filter(function (m) { return m.kind === 'image'; }), btn); }
  function shareImages(p, imgs, btn) {
    var text = p.body || '';
    if (!navigator.share) {
      if (navigator.clipboard && text) navigator.clipboard.writeText(text).then(function () { toast('הטקסט הועתק. את התמונות אפשר לשמור מהתצוגה המלאה.'); });
      else toast('הדפדפן הזה לא תומך בשיתוף. נסו מהטלפון.');
      return;
    }
    if (!imgs.length) { navigator.share({ text: text }).catch(function () {}); return; }
    btn.disabled = true; var old = btn.innerHTML;
    needUrls(imgs.map(function (m) { return m.path; })).then(function () {
      return Promise.all(imgs.map(function (m, i) {
        return fetch(urlOf(m.path)).then(function (r) { return r.blob(); }).then(function (b) { return new File([b], 'yoman-' + p.id + '-' + (i + 1) + '.jpg', { type: 'image/jpeg' }); });
      }));
    }).then(function (files) {
      btn.disabled = false; btn.innerHTML = old;
      var data = { files: files }; if (text) data.text = text;
      if (navigator.canShare && !navigator.canShare(data)) { data = { files: files }; if (!navigator.canShare(data)) return navigator.share({ text: text }); }
      return navigator.share(data);
    }).catch(function (e) { btn.disabled = false; btn.innerHTML = old; if (e && e.name !== 'AbortError') fail(e, 'השיתוף לא הצליח. נסו שוב.'); });
  }

  window.addEventListener('hashchange', function () { if (/[#&][ta]=/.test(location.hash)) { if (/[#&]a=/.test(location.hash)) { S.s = null; } start(); } });
  start();
})();
