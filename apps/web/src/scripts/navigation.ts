const toggles = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.topic-toggle, .topic-subtoggle')
);
const menuButton = document.querySelector<HTMLButtonElement>('#menu');
const mobileNav = document.querySelector<HTMLElement>('#mobile-navigation');

function closeMenu(toggle: HTMLButtonElement) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.parentElement?.querySelectorAll('.topic-subtoggle').forEach((child) => {
    child.setAttribute('aria-expanded', 'false');
  });
}

function setMobileMenu(open: boolean) {
  mobileNav?.classList.toggle('hidden', !open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.querySelectorAll('.navmenu-toggle').forEach((icon, index) => {
    icon.classList.toggle('hidden', open ? index === 0 : index === 1);
  });
}

toggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    const isSubmenu = toggle.classList.contains('topic-subtoggle');
    toggles
      .filter(
        (other) => other !== toggle && (!isSubmenu || other.classList.contains('topic-subtoggle'))
      )
      .forEach(closeMenu);
    toggle.setAttribute('aria-expanded', String(open));
  });
});

menuButton?.addEventListener('click', () =>
  setMobileMenu(menuButton.getAttribute('aria-expanded') !== 'true')
);
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Node)) return;
  const target = event.target;
  toggles.filter((toggle) => !toggle.parentElement?.contains(target)).forEach(closeMenu);
});
document.addEventListener('focusin', (event) => {
  if (!(event.target instanceof Node)) return;
  const target = event.target;
  toggles.filter((toggle) => !toggle.parentElement?.contains(target)).forEach(closeMenu);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const active = [...toggles]
    .reverse()
    .find(
      (toggle) =>
        toggle.getAttribute('aria-expanded') === 'true' &&
        toggle.parentElement?.contains(document.activeElement)
    );
  if (active) {
    closeMenu(active);
    active.focus();
  } else if (menuButton?.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    menuButton.focus();
  } else {
    toggles.forEach(closeMenu);
  }
});
