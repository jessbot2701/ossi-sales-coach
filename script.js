const VOICE_WIDGET_SCRIPT_URL = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.14.10/dist/index.js';
const VOICE_AGENT_ID = 'agent_6201kxfxybwafr4vy1v9pztpbzb5';

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
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

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

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

const consentPanel = document.querySelector('[data-voice-consent]');
const enableVoiceButton = document.querySelector('[data-enable-voice]');
const widgetTarget = document.querySelector('[data-widget-target]');

function loadVoiceWidgetScript() {
  if (window.customElements && window.customElements.get('elevenlabs-convai')) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector('[data-voice-widget-script]');

  if (existingScript && existingScript.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  existingScript?.remove();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = VOICE_WIDGET_SCRIPT_URL;
    script.async = true;
    script.type = 'text/javascript';
    script.dataset.voiceWidgetScript = 'true';

    const timeout = window.setTimeout(() => {
      script.remove();
      reject(new Error('Voice widget load timeout'));
    }, 8000);

    script.addEventListener('load', () => {
      window.clearTimeout(timeout);
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });

    script.addEventListener('error', () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('Voice widget load error'));
    }, { once: true });

    document.head.append(script);
  });
}

async function enableVoiceWidget() {
  enableVoiceButton.disabled = true;
  enableVoiceButton.textContent = 'Voice Agent wird geladen...';
  widgetTarget.textContent = 'Voice Widget wird geladen...';

  try {
    await loadVoiceWidgetScript();

    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', VOICE_AGENT_ID);

    const status = document.createElement('div');
    status.className = 'voice-ready';
    status.innerHTML = '<strong>Voice Agent geladen</strong><span>Klicke unten auf „Ruf mich an!“, um das Training zu starten.</span>';

    widgetTarget.replaceChildren(status, widget);
    consentPanel.hidden = true;
  } catch {
    enableVoiceButton.disabled = false;
    enableVoiceButton.textContent = 'Erneut versuchen';
    widgetTarget.textContent = 'Voice Agent konnte nicht geladen werden. Bitte Verbindung prüfen und erneut versuchen.';
  }
}

if (enableVoiceButton && consentPanel && widgetTarget) {
  enableVoiceButton.addEventListener('click', enableVoiceWidget);
}
