/* ==========================================================
   BTS LIVE 20●● in JAPAN  チケット先行受付LP
   ========================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     設定 1：リンクの遷移先
     URLを入れるとそのまま遷移します。空（''）のままだと
     「リンク未設定」のお知らせが表示されます。
     ---------------------------------------------------------- */
  var LINKS = {
    maxApply: '',        // ドコモMAX先行に申し込む（dアカウント認証 → MAX契約判定）
    maxContract: '',     // ドコモMAX 契約はこちら（MAX契約LP）
    leminoApply: '',     // Leminoプレミアム先行に申し込む（dアカウント認証 → Lemino契約判定）
    leminoContract: '',  // Leminoプレミアム 契約はこちら（Lemino契約LP）
    daccountHelp: '',    // dアカウントのヘルプ
    terms: '',           // 利用規約
    privacy: '',         // プライバシーポリシー
    contact: ''          // お問い合わせ
  };

  /* ----------------------------------------------------------
     設定 2：先行受付の期間と状態
     start / end に日時（例 '2027-01-15T12:00:00+09:00'）を入れると、
     受付前 → 受付中 → 受付終了 が自動で切り替わります。
     日時が空の間は status（'before' | 'open' | 'closed'）の値で表示します。
     periodText   … 「受付期間」に表示する文言
     beforeLabel  … 受付前のボタン文言
     ---------------------------------------------------------- */
  var PRESALES = {
    max: {
      start: '',
      end: '',
      status: 'open',
      periodText: '20●●/●/●(●) ●●:00 〜 ●/●(●) 23:59',
      applyLabel: 'ドコモMAX先行に申し込む',
      beforeLabel: '●/●(●) 受付開始'
    },
    lemino: {
      start: '',
      end: '',
      status: 'before',
      periodText: '20●●/●/●(●) ●●:00 〜 ●/●(●) 23:59',
      applyLabel: 'Leminoプレミアム先行に申し込む',
      beforeLabel: '●/●(●) 受付開始'
    }
  };

  var STATUS_TEXT = { before: '受付前', open: '受付中', closed: '受付終了' };
  var CLOSED_LABEL = '受付は終了しました';

  document.documentElement.classList.add('js');

  /* ---------- 受付状態の判定 ---------- */
  // 表示確認用：URLに ?max=closed&lemino=open のように付けると状態を上書きできます
  var params = new URLSearchParams(location.search);

  function getStatus(key) {
    var forced = params.get(key);
    if (forced && STATUS_TEXT[forced]) return forced;
    var p = PRESALES[key];
    var start = p.start ? new Date(p.start).getTime() : NaN;
    var end = p.end ? new Date(p.end).getTime() : NaN;
    if (!isNaN(start) && !isNaN(end)) {
      var now = Date.now();
      return now < start ? 'before' : now <= end ? 'open' : 'closed';
    }
    return STATUS_TEXT[p.status] ? p.status : 'before';
  }

  function renderPresales() {
    var statuses = [];
    document.querySelectorAll('[data-presale]').forEach(function (card) {
      var key = card.getAttribute('data-presale');
      var p = PRESALES[key];
      if (!p) return;
      var status = getStatus(key);
      statuses.push(status);
      card.setAttribute('data-status', status);
      card.querySelector('[data-role="status"]').textContent = STATUS_TEXT[status];
      card.querySelector('[data-role="period"]').textContent = p.periodText;

      var btn = card.querySelector('[data-role="apply"]');
      var arrow = '<span class="btn__arrow" aria-hidden="true"></span>';
      if (status === 'open') {
        btn.innerHTML = p.applyLabel + arrow;
        btn.removeAttribute('aria-disabled');
        btn.removeAttribute('tabindex');
      } else {
        btn.textContent = status === 'before' ? p.beforeLabel : CLOSED_LABEL;
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('tabindex', '-1');
      }
    });

    // ファーストビューの帯・固定ボタンの文言
    var badge = document.getElementById('heroBadge');
    var dockBtn = document.getElementById('dockBtn');
    var anyOpen = statuses.indexOf('open') !== -1;
    var anyBefore = statuses.indexOf('before') !== -1;
    var down = '<span class="btn__arrow btn__arrow--down" aria-hidden="true"></span>';
    if (anyOpen) {
      badge.innerHTML = '<span>ドコモMAX・Leminoプレミアム</span> <span>先行受付中</span>';
      badge.classList.remove('is-off');
      dockBtn.innerHTML = '先行に申し込む' + down;
    } else if (anyBefore) {
      badge.innerHTML = '<span>ドコモMAX・Leminoプレミアム</span> <span>先行受付 まもなく開始</span>';
      badge.classList.remove('is-off');
      dockBtn.innerHTML = '先行受付をチェックする' + down;
    } else {
      badge.textContent = '先行受付は終了しました';
      badge.classList.add('is-off');
      dockBtn.innerHTML = '先行受付の内容を見る' + down;
    }
  }
  renderPresales();
  setInterval(renderPresales, 30000); // 開いたままでも受付開始・終了を反映

  /* ---------- リンク（未設定ならお知らせを表示） ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(html) {
    toast.innerHTML = html;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 3200);
  }

  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = LINKS[a.getAttribute('data-link')];
    if (url) a.setAttribute('href', url);
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (a.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      return;
    }
    if (a.hasAttribute('data-link') && !LINKS[a.getAttribute('data-link')]) {
      e.preventDefault();
      var label = a.textContent.trim();
      showToast('<b>リンク未設定</b>　「' + label + '」の遷移先は準備中です');
    }
  });

  /* ---------- スマホメニュー ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) setMenu(false);
  });

  /* ---------- アニメーション ---------- */
  // 見出し・タイトルを1文字ずつに分割
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    Array.prototype.forEach.call(text, function (c, i) {
      var s = document.createElement('span');
      s.className = c === ' ' ? 'ch sp' : 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    });
  });

  // ファーストビューの登場（アー写の読み込み完了を待つ。遅い場合も2秒で開始）
  var kv = document.querySelector('.hero__photo img');
  var started = false;
  function start() {
    if (started) return;
    started = true;
    requestAnimationFrame(function () { document.documentElement.classList.add('is-loaded'); });
  }
  if (kv.complete) start(); else { kv.addEventListener('load', start); kv.addEventListener('error', start); }
  setTimeout(start, 2000);

  // アー写のパララックス（PCのみ）
  var kvMove = document.getElementById('kvMove');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  function parallax() {
    ticking = false;
    if (window.innerWidth <= 760 || reduce) { kvMove.style.transform = ''; return; }
    var y = Math.min(window.scrollY, window.innerHeight);
    kvMove.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0)';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    // スクロールで登場
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          revealIO.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal, .sec-head').forEach(function (el) { revealIO.observe(el); });

    // ナビの現在地
    var navLinks = {};
    document.querySelectorAll('.nav__list a').forEach(function (a) {
      navLinks[a.getAttribute('href').slice(1)] = a;
    });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navLinks).forEach(function (id) {
          navLinks[id].classList.toggle('is-current', id === en.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { navIO.observe(s); });

    // スマホ固定ボタン：ファーストビューと先行受付セクションでは隠す
    var dock = document.getElementById('dock');
    var hidden = { hero: true, presale: false };
    var dockIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        hidden[en.target.id === 'presale' ? 'presale' : 'hero'] = en.isIntersecting;
      });
      dock.classList.toggle('is-show', !hidden.hero && !hidden.presale);
    });
    dockIO.observe(document.querySelector('.hero__cta'));
    dockIO.observe(document.getElementById('presale'));
  } else {
    document.querySelectorAll('.reveal, .sec-head').forEach(function (el) { el.classList.add('is-in'); });
  }
})();
