(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav');
  const closeMenu = () => {
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation?.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const image = element.matches('figure, .intro-pictures, .hero-media');
        element.style.animationDelay = `${Number(element.dataset.delay || 0)}ms`;
        element.classList.add(image ? 'reveal-picture' : 'reveal-in');
        observer.unobserve(element);
      });
    }, { threshold: .12 });
    document.querySelectorAll('[data-reveal], .page-intro h1, .page-intro p, .contact-data > div, .contact-form h2, .contact-form .field, .contact-form .btn, .contact-band h2, .contact-band p, .band-actions, .footer-grid > div').forEach(element => observer.observe(element));
  }
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('motion-paused', document.hidden);
  });

  const solutionChoices = [...document.querySelectorAll('.solution-choice')];
  const solutionPanels = [...document.querySelectorAll('.solution-panel')];
  if (solutionChoices.length) {
    const chooseSolution = (index, animate = false) => {
      solutionChoices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      solutionPanels.forEach((panel, i) => { panel.hidden = i !== index; });
      if (animate && !reduceMotion.matches) {
        solutionPanels[index].animate([{ opacity: .5 }, { opacity: 1 }], { duration: 350 });
      }
    };
    document.querySelector('.solution-controls').hidden = false;
    document.querySelector('.solution-panels').classList.add('solutions-ready');
    chooseSolution(0);
    solutionChoices.forEach((button, index) => {
      button.addEventListener('click', () => chooseSolution(index, true));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? solutionChoices.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + solutionChoices.length) % solutionChoices.length;
        solutionChoices[next].focus();
        chooseSolution(next, true);
      });
    });
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const filters = document.querySelector('.filters');
  if (filters) filters.hidden = false;
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const status = document.querySelector('.filter-status');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    galleryItems.forEach(item => { item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
    if (status) status.textContent = `${galleryItems.filter(item => !item.hidden).length} hình ảnh · ${button.textContent.trim()}`;
  }));

  const dialog = document.querySelector('.lightbox');
  if (dialog) {
    let current = 0;
    let opener;
    const visible = () => galleryItems.filter(item => !item.hidden);
    const show = index => {
      const items = visible();
      current = (index + items.length) % items.length;
      const source = items[current].querySelector('img');
      const target = dialog.querySelector('.lightbox-image');
      target.src = source.src;
      target.alt = source.alt;
      dialog.querySelector('.lightbox-caption').textContent = `${current + 1} / ${items.length} — ${source.alt}`;
    };
    galleryItems.forEach(item => item.querySelector('.gallery-open').addEventListener('click', event => {
      event.preventDefault();
      opener = event.currentTarget;
      show(visible().indexOf(item));
      dialog.showModal();
      document.body.classList.add('modal-open');
    }));
    dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      opener?.focus();
    });
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    const service = new URLSearchParams(location.search).get('dich-vu');
    const serviceField = form.elements.namedItem('service');
    if (service && [...serviceField.options].some(option => option.value === service)) serviceField.value = service;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = form.elements.namedItem('name');
      name.setCustomValidity(name.value.trim() ? '' : 'Vui lòng nhập họ và tên.');
      const phone = form.elements.namedItem('phone');
      phone.setCustomValidity('');
      const digits = phone.value.replace(/[\s().+-]/g, '');
      if (!/^\d{9,15}$/.test(digits)) {
        phone.setCustomValidity('Vui lòng nhập số điện thoại hợp lệ, từ 9 đến 15 chữ số.');
      }
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = `Yêu cầu tư vấn: ${data.get('service')}`;
      const body = [
        'Kính gửi Ngân Hà EC,', '',
        `Tôi là: ${data.get('name').trim()}`,
        `Điện thoại: ${data.get('phone').trim()}`,
        `Email: ${String(data.get('email') || '').trim() || 'Chưa cung cấp'}`,
        `Nhu cầu: ${data.get('service')}`, '',
        String(data.get('message') || '').trim(), '',
        'Vui lòng liên hệ để trao đổi thêm. Cảm ơn!'
      ].join('\r\n');
      const mailto = `mailto:nganhaec@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const result = form.querySelector('.form-result');
      result.hidden = false;
      result.replaceChildren(document.createTextNode('Nội dung đã sẵn sàng. '));
      const link = document.createElement('a');
      link.href = mailto;
      link.textContent = 'Mở ứng dụng email để gửi';
      result.append(link, document.createTextNode('. Yêu cầu chỉ được gửi khi bạn bấm Gửi trong ứng dụng email. Bạn cũng có thể gọi 0987 810 694.'));
      result.focus();
    });
    form.elements.namedItem('phone').addEventListener('input', event => event.target.setCustomValidity(''));
    form.elements.namedItem('name').addEventListener('input', event => event.target.setCustomValidity(''));
  }
})();
