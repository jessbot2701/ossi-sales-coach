const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('.prompt-chip').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.dataset.copy;
    const hint = document.querySelector('.copy-hint');

    try {
      await navigator.clipboard.writeText(text);
      document.querySelectorAll('.prompt-chip.copied').forEach((item) => item.classList.remove('copied'));
      button.classList.add('copied');
      hint.textContent = 'Satz kopiert – du kannst ihn im Training verwenden.';
      window.setTimeout(() => {
        button.classList.remove('copied');
        hint.textContent = 'Tipp: Klicke auf einen Satz, um ihn zu kopieren.';
      }, 2200);
    } catch {
      hint.textContent = `Beispielsatz: ${text}`;
    }
  });
});
