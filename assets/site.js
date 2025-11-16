// === Navbar transparent -> blue on scroll (v08, home-only) ===
(function(){
  var nav = document.querySelector('.main-nav');
  var isHome = document.body && document.body.classList.contains('home');
  if(!nav) return;
  function onScroll(){
    if(!isHome){ nav.classList.add('scrolled'); return; }
    if(window.scrollY > 10){
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('load', onScroll, {passive:true});
})();




// === v36-sticky nav + dropdown hover/focus ===
(function(){
  const nav = document.querySelector('.main-nav');
  if (!nav) return;
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand-blue') || '#003a70';

  // keep a spacer for layout when nav becomes fixed
  let spacer = null;
  function ensureSpacer() {
    if(!spacer){
      spacer = document.createElement('div');
      spacer.id = 'nav-spacer';
      spacer.style.height = nav.offsetHeight + 'px';
      nav.parentNode.insertBefore(spacer, nav);
    } else {
      spacer.style.height = nav.offsetHeight + 'px';
    }
  }

  function removeSpacer() {
    if(spacer && spacer.parentNode){
      spacer.parentNode.removeChild(spacer);
      spacer = null;
    }
  }

  function onScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    const max = 100; // px to reach full blue
    const alpha = Math.min(1, y / max);
    nav.style.backgroundColor = `rgba(0,58,112,${alpha})`;
    if(y > 1){
      ensureSpacer();
      nav.classList.add('fixed');
      nav.style.position = 'fixed';
      nav.style.top = '0';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.zIndex = '120';
    }else{
      nav.classList.remove('fixed');
      nav.style.position = '';
      nav.style.top = '';
      nav.style.left = '';
      nav.style.right = '';
      nav.style.zIndex = '';
      removeSpacer();
    }
  }

  function updateNavMode(){
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    // attach hover/focus for dropdown on desktop only
    const dropdown = nav.querySelector('.has-dropdown');
    if(!dropdown) return;
    const menu = dropdown.querySelector('.dropdown');

    function openDrop(){
      dropdown.classList.add('open');
      if(menu){
        menu.setAttribute('aria-hidden','false');
      }
    }
    function closeDrop(){
      dropdown.classList.remove('open');
      if(menu){
        menu.setAttribute('aria-hidden','true');
      }
    }
    if(isDesktop){
      dropdown.addEventListener('mouseenter', openDrop);
      dropdown.addEventListener('mouseleave', closeDrop);
      dropdown.addEventListener('focusin', openDrop);
      dropdown.addEventListener('focusout', function(e){
        if(!dropdown.contains(e.relatedTarget)){
          closeDrop();
        }
      });
    }else{
      dropdown.removeEventListener('mouseenter', openDrop);
      dropdown.removeEventListener('mouseleave', closeDrop);
    }
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('load', onScroll, {passive:true});
  window.addEventListener('resize', updateNavMode, {passive:true});
  window.addEventListener('load', updateNavMode, {passive:true});
})();


// === Smooth scroll for internal anchors & “scroll-down” button ===
(function(){
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(function(link){
    link.addEventListener('click', function(e){
      const href = link.getAttribute('href');
      if(href === '#' || href === '#0') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  const scrollBtn = document.querySelector('[data-scroll-target]');
  if(scrollBtn){
    scrollBtn.addEventListener('click', function(e){
      e.preventDefault();
      const t = scrollBtn.getAttribute('data-scroll-target');
      if(!t) return;
      const el = document.querySelector(t);
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }
})();


// === Simple “play on click” for hero video (if present) ===
(function(){
  const video = document.querySelector('.hero-video video');
  const overlayBtn = document.querySelector('.hero-video .video-play');
  if(!video || !overlayBtn) return;

  overlayBtn.addEventListener('click', function(){
    if(video.paused){
      video.play();
      overlayBtn.classList.add('hidden');
    }else{
      video.pause();
      overlayBtn.classList.remove('hidden');
    }
  });

  // pause video when leaving the page visibility
  document.addEventListener('visibilitychange', function(){
    if(document.hidden && !video.paused){
      video.pause();
      overlayBtn.classList.remove('hidden');
    }
  });
})();


// === Simple event carousel (osservatorio/progetti) ===
(function(){
  const carousel = document.querySelector('.events-carousel');
  if(!carousel) return;

  const track = carousel.querySelector('.ev-track');
  const prev = carousel.querySelector('.ev-nav.prev');
  const next = carousel.querySelector('.ev-nav.next');

  function updateButtons(){
    // Allow small epsilon for floating scroll values
    const maxScrollLeft = track.scrollWidth - track.clientWidth - 2;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= maxScrollLeft;
    if(prev) prev.disabled = atStart;
    if(next) next.disabled = atEnd;
  }

  function scrollByCard(dir){
    const card = track.querySelector('.ev-card');
    if(!card) return;
    const style = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth
      + parseFloat(style.marginLeft || 0)
      + parseFloat(style.marginRight || 0);
    const amount = cardWidth * 1.1;
    track.scrollBy({left: dir * amount, behavior: 'smooth'});
    setTimeout(updateButtons, 300);
  }

  prev && prev.addEventListener('click', function(){
    scrollByCard(-1);
  });
  next && next.addEventListener('click', function(){
    scrollByCard(1);
  });

  track.addEventListener('scroll', updateButtons, {passive:true});
  window.addEventListener('resize', updateButtons, {passive:true});
  window.addEventListener('load', updateButtons, {passive:true});
})();


// === Render profiles from JSON on components/experts pages ===
(function(){
  const grid = document.querySelector('#profile-grid');
  if (!grid) return;
  const dataset = grid.getAttribute('data-src'); // 'componenti' or 'esperti'
  if (!dataset) return;

  fetch(`assets/data/${dataset}.json`)
    .then(r => r.json())
    .then(items => {
      grid.innerHTML = '';
      items.forEach(it => {
        const card = document.createElement('article');
        card.className = 'profile-card card';

        const img = document.createElement('img');
        img.className = 'profile-avatar';
        img.alt = it.nome || 'Avatar';
        img.src = `assets/img/foto_cv/${it.foto || 'placeholder.svg'}`;

        const name = document.createElement('div');
        name.className = 'profile-name';
        name.textContent = it.nome || '';

        const role = document.createElement('div');
        role.className = 'profile-role';
        role.textContent = it.ruolo || '';

        const actions = document.createElement('div');
        actions.className = 'profile-actions';

        const btn = document.createElement('a');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Scarica CV';

        if (it.cv) {
          btn.href = it.cv;
          btn.target = '_blank';
          btn.rel = 'noopener';
        } else {
          btn.href = '#';
          btn.setAttribute('aria-disabled', 'true');
          btn.addEventListener('click', (e) => { e.preventDefault(); });
        }

        actions.appendChild(btn);
        card.append(img, name, role, actions);
        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Errore caricamento profili', err);
      grid.innerHTML = '<p>Impossibile caricare i profili in questo momento.</p>';
    });
})();
