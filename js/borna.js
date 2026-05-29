/* ===========================================================
   Borna Khodro Pars — Shared Interactions
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initSiteImages();
  initSiteData();
  initHeroSlider();
  initScrollReveal();
  initNavScroll();
  initPhoneLinks();
});

// When admin panel saves data in another tab, update this page too
window.addEventListener('storage', function (e) {
  if (e.key === 'borna_admin_images' || e.key === 'borna_admin_data') {
    initSiteImages();
    initSiteData();
  }
});
// BroadcastChannel for IndexedDB sync (storage event only catches localStorage changes)
try {
  var bc = new BroadcastChannel('borna_images');
  bc.onmessage = function(e) {
    if (e.data === 'images-updated') { initSiteImages(); }
    if (e.data === 'data-updated') { initSiteData(); }
  };
} catch(e) {}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-menu');
  var overlay = document.querySelector('.mobile-overlay');
  var close = document.querySelector('.mobile-menu-close');
  if (!toggle || !menu || !overlay) return;

  function open() { menu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { menu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
}

/* ---- Hero Slider ---- */
function initHeroSlider() {
  var slider = document.querySelector('.hero');
  if (!slider) return;
  var slides = slider.querySelectorAll('.hero-slide');
  var dots = slider.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  var current = 0;
  var timer = null;
  var video = document.getElementById('hero-video');
  var soundBtn = document.getElementById('sound-toggle');

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function scheduleNext() {
    clearTimer();
    if (current === 0 && video) {
      return;
    }
    timer = setTimeout(function () {
      next();
    }, 7000);
  }

  function goTo(index) {
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === index);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === index);
    });
    current = index;
    if (current === 0 && video) {
      video.currentTime = 0;
      if (video.paused) { video.play().catch(function(){}); }
    }
    scheduleNext();
  }

  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  if (soundBtn && video) {
    soundBtn.addEventListener('click', function () {
      video.muted = !video.muted;
      soundBtn.classList.toggle('unmuted', !video.muted);
      soundBtn.innerHTML = video.muted
        ? '<i class="bi bi-volume-mute-fill"></i>'
        : '<i class="bi bi-volume-up-fill"></i>';
      soundBtn.setAttribute('aria-label', video.muted ? 'فعال کردن صدا' : 'قطع صدا');
    });
    var lastTime = 0;
    video.addEventListener('timeupdate', function () {
      if (lastTime > 2 && video.currentTime < 1 && !video.muted) {
        video.muted = true;
        soundBtn.classList.remove('unmuted');
        soundBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        soundBtn.setAttribute('aria-label', 'فعال کردن صدا');
      }
      lastTime = video.currentTime;
    });
    video.addEventListener('ended', function () {
      if (current === 0) { next(); }
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });

  var prevBtn = slider.querySelector('.hero-arrow.prev');
  var nextBtn = slider.querySelector('.hero-arrow.next');
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); });

  goTo(0);
  if (video) { video.play().catch(function(){}); }
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  var els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { observer.observe(el); });
}

/* ---- Nav scroll shadow ---- */
function initNavScroll() {
  var header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
  });
}

/* ---- Global Form Handler ---- */
function handleSubmit(event, message) {
  event.preventDefault();
  var form = event.target;
  var btn = form.querySelector('button[type="submit"]');
  var original = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = '<i class="bi bi-check-lg"></i> در حال ارسال...'; btn.disabled = true; }
  setTimeout(function () {
    if (btn) { btn.innerHTML = '<i class="bi bi-check-circle"></i> ' + message; btn.style.background = '#059669'; }
    form.reset();
    setTimeout(function () {
      if (btn) { btn.innerHTML = original; btn.disabled = false; btn.style.background = ''; }
    }, 3000);
  }, 800);
}

/* ---- IndexedDB helpers (reusable) ---- */
var DB = {
  dbName: 'borna_images',
  storeName: 'images',
  open: function() {
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(DB.dbName, 1);
      req.onerror = function() { reject(req.error); };
      req.onupgradeneeded = function(e) {
        e.target.result.createObjectStore(DB.storeName);
      };
      req.onsuccess = function(e) { resolve(e.target.result); };
    });
  },
  loadAll: function() {
    return DB.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(DB.storeName, 'readonly');
        var store = tx.objectStore(DB.storeName);
        var req = store.openCursor();
        var result = {};
        req.onerror = function() { db.close(); reject(req.error); };
        req.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            result[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            db.close();
            resolve(result);
          }
        };
      });
    });
  }
};

/* ---- Apply image data to DOM elements ---- */
function applyImages(imgData) {
  if (!imgData || !Object.keys(imgData).length) return;
  Object.keys(imgData).forEach(function (key) {
    var info = imgData[key];
    if (!info) return;
    var hasData = info.data && info.data.length > 50;
    if (!hasData) return;

    var els = document.querySelectorAll('[data-img="' + key + '"]');
    els.forEach(function (el) {
      if (el.tagName === 'IMG') {
        el.src = info.data;
      } else if (el.tagName === 'VIDEO') {
        if (el.querySelector('source')) {
          el.querySelector('source').src = info.data;
        } else {
          el.src = info.data;
        }
        el.load();
      } else if (el.tagName === 'SOURCE') {
        el.src = info.data;
      } else if (el.tagName === 'LINK' && el.rel === 'icon') {
        el.href = info.data;
      } else if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
        el.style.setProperty('background-image', 'url("' + info.data + '")', 'important');
      }
    });

    var posters = document.querySelectorAll('[data-img-poster="' + key + '"]');
    posters.forEach(function (el) {
      if (el.tagName === 'VIDEO') {
        el.poster = info.data;
      }
    });
  });
}

/* ---- Load admin-managed images (IndexedDB → localStorage fallback) ---- */
function initSiteImages() {
  // Try IndexedDB first (supports large images)
  DB.loadAll().then(function(dbImages) {
    if (Object.keys(dbImages).length) {
      applyImages(dbImages);
      return;
    }
    // Fallback: localStorage
    try {
      var lsRaw = localStorage.getItem('borna_admin_images');
      if (lsRaw) { applyImages(JSON.parse(lsRaw)); return; }
      var adRaw = localStorage.getItem('borna_admin_data');
      if (adRaw) {
        var ad = JSON.parse(adRaw);
        if (ad.images) { applyImages(ad.images); }
      }
    } catch(e) {}
  }).catch(function() {
    // IndexedDB failed — try localStorage
    try {
      var lsRaw = localStorage.getItem('borna_admin_images');
      if (lsRaw) { applyImages(JSON.parse(lsRaw)); return; }
      var adRaw = localStorage.getItem('borna_admin_data');
      if (adRaw) {
        var ad = JSON.parse(adRaw);
        if (ad.images) { applyImages(ad.images); }
      }
    } catch(e) {}
  });
}

/* ---- Dot-path helper (mirrors admin.html getByPath) ---- */
function getByPath(obj, path) {
  return path.split('.').reduce(function(o, k) {
    if (o && typeof o === 'object' && k in o) return o[k];
    var ki = parseInt(k, 10);
    if (o && Array.isArray(o) && !isNaN(ki) && ki >= 0 && ki < o.length) return o[ki];
    return undefined;
  }, obj);
}

/* ---- Render a single dynamic item card ---- */
/* ---- Embedded defaults for site pages (used when admin panel hasn't saved data) ---- */
function getDefaultSiteData() {
  return {
    home: {
      news: [
        { date: '۱۵ اردیبهشت ۱۴۰۵', title: 'رونمایی از جدیدترین کامیون BORNA 560 S در نمایشگاه خودرو تهران', desc: 'برنا خودرو پارس در نمایشگاه بین‌المللی خودرو تهران از جدیدترین محصول خود رونمایی کرد.' },
        { date: '۲ فروردین ۱۴۰۵', title: 'کسب جایزه کیفیت برتر صنعت خودروسازی ایران', desc: 'برای سومین سال پیاپی، برنا خودرو پارس موفق به کسب جایزه ملی کیفیت در صنعت خودرو شد.' },
        { date: '۱۰ اسفند ۱۴۰۴', title: 'صادرات به سومین کشور منطقه — گام بلند در توسعه بازار', desc: 'برنا خودرو پارس قرارداد صادرات محصولات خود را با سومین کشور همسایه امضا کرد.' }
      ]
    },
    product: {
      blog: [
        { date: '۱۵ اردیبهشت ۱۴۰۵', title: 'معرفی کامیون BORNA 560 S — نسل جدید حمل‌ونقل جاده‌ای', desc: 'کامیون BORNA 560 S با موتور کامینز Z14E560 و گیربکس ZF Traxon، استاندارد جدیدی در صنعت حمل‌ونقل ایران تعریف کرده است.' },
        { date: '۸ اردیبهشت ۱۴۰۵', title: 'نگاهی به پیشرانه کامینز Z14E560 — قدرت و دوام در کنار هم', desc: 'موتور ۱۳.۵ لیتری کامینز Z14E560 با ۵۶۰ اسب‌بخار قدرت و ۲۶۵۰ نیوتن‌متر گشتاور، یکی از پیشرفته‌ترین موتورهای حمل‌ونقل سنگین است.' },
        { date: '۱ اردیبهشت ۱۴۰۵', title: 'راهنمای سرویس و نگهداری BORNA 560 S', desc: 'برنامه سرویس دوره‌ای هر ۱۰۰,۰۰۰ کیلومتر، استفاده از روغن موتور استاندارد و بازرسی منظم سیستم ترمز WABCO EBS از مهم‌ترین نکات نگهداری این کامیون است.' }
      ]
    },
    contact: {
      factoryAddress: 'شیراز، منطقه ویژه اقتصادی شیراز، بلوار تجارت شرقی',
      factoryPhone: '۰۷۱-۳۶۵۴۳۲۱۰'
    },
    company: {
      factoryAddress: 'شیراز، منطقه ویژه اقتصادی شیراز، بلوار تجارت شرقی',
      factoryPhone: '۰۷۱-۳۶۵۴۳۲۱۰',
      footerStory: 'شرکت برنا خودرو پارس با سرمایه‌گذاری و مشارکت فعالان کلیدی صنعت حمل‌ونقل و متخصصان صنایع زیربنایی تأسیس شده است. ما با عشق به ایران عزیز و اتکا به دانش، تجربه و انگیزه جوانان متخصص ایرانی در صنعت خودروهای تجاری، محصولاتی را عرضه می‌کنیم که دقیقاً پاسخگوی نیازهای واقعی صنعت حمل‌ونقل باشند.'
    },
    about: {
      values: [
        { title: 'کیفیت پایدار', desc: 'تولید محصولاتی با دوام بالا که در طول عمر مفید خود، عملکردی قابل اعتماد و بدون افت کیفیت ارائه دهند.' },
        { title: 'ایمنی اولویت اول', desc: 'طراحی و تولید بر اساس بالاترین استانداردهای ایمنی برای حفاظت از راننده، سرنشینان و بار.' },
        { title: 'کاهش هزینه عملیاتی', desc: 'بهینه‌سازی مصرف سوخت و افزایش فاصله بین سرویس‌ها برای پایین آوردن هزینه تمام شده به ازای هر کیلومتر.' },
        { title: 'تعهد به مشتری', desc: 'ارائه خدمات پشتیبانی سریع و در دسترس همراه با تأمین قطعات اصلی در کوتاه‌ترین زمان ممکن.' },
        { title: 'دانش بومی، نگاه جهانی', desc: 'اتکا به توان مهندسان ایرانی در کنار بهره‌گیری از فناوری‌های روز جهان برای تولید محصولی رقابتی.' },
        { title: 'ارزش‌آفرینی برای کشور', desc: 'حمایت از اشتغال، کاهش وابستگی به واردات خودروی کامل و کمک به توسعه ناوگان حمل‌ونقل ملی.' }
      ]
    }
  };
}

function renderItemCard(item, i, type) {
  var gradients = ['linear-gradient(135deg, #133e87, #0d1a30)', 'linear-gradient(135deg, #1e40af, #133e87)', 'linear-gradient(135deg, #0d1a30, #1a3a15)', 'linear-gradient(135deg, #133e87, #2a5caa)', 'linear-gradient(135deg, #0d1a30, #3a4a6a)', 'linear-gradient(135deg, #1e40af, #2a5caa)'];
  var icons = ['newspaper', 'trophy', 'globe2', 'megaphone', 'award', 'calendar-event'];
  var g = gradients[i % gradients.length];
  var icon = icons[i % icons.length];
  var date = item.date || '';
  var title = item.title || '';
  var desc = item.desc || '';
  return '<article class="news-card">' +
    '<div style="height:200px; background:' + g + '; display:flex; align-items:center; justify-content:center;">' +
    '<i class="bi bi-' + icon + '" style="font-size:40px; color:rgba(255,255,255,0.12);"></i></div>' +
    '<div class="news-body"><span class="date"><i class="bi bi-calendar3"></i> ' + date + '</span>' +
    '<h4>' + title + '</h4><p>' + desc + '</p></div></article>';
}

function renderBlogCard(item, i) {
  var gradients = ['linear-gradient(135deg, #133e87, #0d1a30)', 'linear-gradient(135deg, #1a3a5c, #2d6a9f)', 'linear-gradient(135deg, #2d5016, #4a8c2a)', 'linear-gradient(135deg, #133e87, #2a5caa)', 'linear-gradient(135deg, #0d1a30, #3a4a6a)'];
  var icons = ['truck', 'gear', 'calendar-check', 'book', 'lightning'];
  var g = gradients[i % gradients.length];
  var icon = icons[i % icons.length];
  var date = item.date || '';
  var title = item.title || '';
  var desc = item.desc || '';
  return '<article class="pd-blog-card">' +
    '<div class="pd-blog-card-img" style="background:' + g + '; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.3); font-size:48px;">' +
    '<i class="bi bi-' + icon + '"></i></div>' +
    '<div class="pd-blog-card-body"><span class="pd-blog-card-date"><i class="bi bi-calendar3"></i> ' + date + '</span>' +
    '<h3>' + title + '</h3>' +
    '<p>' + desc + '</p></div>' +
    '<div class="pd-blog-card-footer"><a href="#">ادامه مطلب <i class="bi bi-arrow-left"></i></a></div></article>';
}

/* ---- Apply admin-managed texts to DOM elements ---- */
function initSiteData() {
  try {
    var raw = localStorage.getItem('borna_admin_data');
    var data;
    if (raw) {
      data = JSON.parse(raw);
    }
    if (!data || typeof data !== 'object') {
      // Fall back to embedded defaults so static sections render
      // even when admin panel hasn't been opened yet
      data = getDefaultSiteData();
    }

    // Apply data-text elements (textContent or input value)
    document.querySelectorAll('[data-text]').forEach(function(el) {
      var path = el.getAttribute('data-text');
      var val = getByPath(data, path);
      if (val === undefined || val === null) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.value = val;
      } else {
        el.textContent = val;
      }
    });

    // Apply data-text-html elements (innerHTML)
    document.querySelectorAll('[data-text-html]').forEach(function(el) {
      var path = el.getAttribute('data-text-html');
      var val = getByPath(data, path);
      if (val === undefined || val === null) return;
      el.innerHTML = val;
    });

    // Apply data-text-title (title attribute)
    document.querySelectorAll('[data-text-title]').forEach(function(el) {
      var path = el.getAttribute('data-text-title');
      var val = getByPath(data, path);
      if (val === undefined || val === null) return;
      el.setAttribute('title', val);
    });

    // Apply data-text-href (link href)
    document.querySelectorAll('[data-text-href]').forEach(function(el) {
      var path = el.getAttribute('data-text-href');
      var val = getByPath(data, path);
      if (val === undefined || val === null) return;
      el.href = val;
    });

    // Dynamically render news from array (home page)
    var newsContainer = document.getElementById('newsContainer');
    var newsItems = data.home && data.home.news ? data.home.news : [];
    if (newsContainer && newsItems.length > 0) {
      newsContainer.innerHTML = newsItems.map(function(item, i) { return renderItemCard(item, i, 'news'); }).join('');
    }

    // Dynamically render blog from array (product page)
    var blogContainer = document.getElementById('blogContainer');
    var blogItems = data.product && data.product.blog ? data.product.blog : [];
    if (blogContainer && blogItems.length > 0) {
      blogContainer.innerHTML = blogItems.map(function(item, i) { return renderBlogCard(item, i); }).join('');
    }

    // Set up carousel arrows for each .carousel-wrap
    setupCarousels();
  } catch(e) {
    console.warn('initSiteData:', e);
  }
}

/* ---- Carousel arrow navigation with looping ---- */
function setupCarousels() {
  document.querySelectorAll('.carousel-wrap').forEach(function(wrap) {
    var inner = wrap.querySelector('.carousel-inner');
    var controls = wrap.nextElementSibling;
    if (!controls || !controls.classList.contains('carousel-controls')) return;
    var prev = controls.querySelector('.carousel-prev');
    var next = controls.querySelector('.carousel-next');
    if (!inner || !prev || !next) return;

    function step(dir) {
      var card = inner.querySelector('> *');
      if (!card) return;
      var cardW = card.offsetWidth + 16; // width + gap
      var maxScroll = inner.scrollWidth - inner.clientWidth;
      var target;
      if (dir === 1) {
        target = Math.min(inner.scrollLeft + cardW, maxScroll);
        if (target >= maxScroll - 2) target = 0; // loop to first
      } else {
        target = Math.max(inner.scrollLeft - cardW, 0);
        if (target <= 2) target = maxScroll; // loop to last
      }
      inner.scrollTo({ left: target, behavior: 'smooth' });
    }

    prev.addEventListener('click', function() { step(-1); });
    next.addEventListener('click', function() { step(1); });
  });
}

/* ---- Smart Phone Links ---- */
function initPhoneLinks() {
  var persianMap = { '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9' };
  var items = document.querySelectorAll('[data-text*="phone"], [data-text*="Phone"]');
  for (var i = 0; i < items.length; i++) {
    var el = items[i];
    if (el.closest('a[data-phone]') || el.dataset.processed) continue;

    var raw = (el.textContent || '').trim();
    var cleaned = raw.replace(/[-\s\u200c]/g, '');
    var tel = '';
    for (var j = 0; j < cleaned.length; j++) {
      tel += persianMap[cleaned[j]] || cleaned[j];
    }

    // Only process if it looks like an Iranian phone number
    if (!/^0\d{9,}$/.test(tel)) continue;

    var a = document.createElement('a');
    a.href = 'tel:' + tel;
    a.setAttribute('data-phone', '');
    a.setAttribute('data-text', el.getAttribute('data-text') || '');
    a.textContent = raw;
    a.style.cssText = 'color:inherit;text-decoration:none;border-bottom:1px dashed currentColor;cursor:pointer;';
    a.addEventListener('click', function(e) {
      // Desktop (no touch): copy to clipboard instead of dialing
      if (!('ontouchstart' in window)) {
        e.preventDefault();
        navigator.clipboard.writeText(this.textContent).then(function() {
          showPhoneToast();
        }).catch(function() {});
      }
      // Mobile: let tel: link open the dialer naturally
    });

    el.parentNode.replaceChild(a, el);
    a.dataset.processed = 'true';
  }
}

function showPhoneToast() {
  var t = document.createElement('div');
  t.textContent = '✅ شماره کپی شد';
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:12px 28px;border-radius:10px;z-index:99999;font:14px/1 sans-serif;direction:rtl;opacity:0;transition:opacity 0.3s;box-shadow:0 8px 30px rgba(0,0,0,0.3);pointer-events:none;';
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.style.opacity = '1'; });
  setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 1800);
}
