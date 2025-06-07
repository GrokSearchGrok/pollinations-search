// js/generate.js

function openResultsTab(prompt, model, width, height, count, infinite, nologo, privateMode) {
  const url = new URL('results.html', window.location.href);
  url.searchParams.set('prompt', prompt);
  url.searchParams.set('model', model);
  if (width) url.searchParams.set('width', width);
  if (height) url.searchParams.set('height', height);
  url.searchParams.set('count', count);
  url.searchParams.set('infinite', infinite);
  url.searchParams.set('nologo', nologo);
  url.searchParams.set('private', privateMode);
  window.open(url.toString(), '_blank');
}

if (document.getElementById('promptForm')) {
  document.getElementById('promptForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value;
    const model = document.getElementById('model').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const count = document.getElementById('count').value;
    const infinite = document.getElementById('infiniteMode').checked;
    const nologo = document.getElementById('nologo').checked;
    const privateMode = document.getElementById('privateMode').checked;

    openResultsTab(prompt, model, width, height, count, infinite, nologo, privateMode);
  });
} else {
  // We are in results.html
  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    const model = params.get('model');
    const width = params.get('width') || 512;
    const height = params.get('height') || 512;
    const count = parseInt(params.get('count') || '10', 10);
    const infinite = params.get('infinite') === 'true';
    const nologo = params.get('nologo') === 'true';
    const privateMode = params.get('private') === 'true';

    let stopped = false;
    let generated = 0;

    const stopBtn = document.getElementById('stopBtn');
    const clearBtn = document.getElementById('clearBtn');
    const grid = document.getElementById('resultsGrid');

    stopBtn.onclick = () => stopped = true;
    clearBtn.onclick = () => grid.innerHTML = '';

    async function generateImage() {
      if (stopped || (!infinite && generated >= count)) return;

      const seed = Math.floor(Math.random() * 1e9);
      const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
      const params = [
        `model=${model}`,
        `width=${width}`,
        `height=${height}`,
        `seed=${seed}`,
        nologo ? 'nologo=true' : '',
        privateMode ? 'private=true' : ''
      ].filter(Boolean).join('&');

      const fullUrl = `${baseUrl}?${params}`;
      const card = document.getElementById('imageCardTemplate').content.cloneNode(true);
      const img = card.querySelector('img');
      img.src = fullUrl;

      const meta = card.querySelector('.meta');
      meta.querySelector('.prompt-text').textContent = prompt;
      meta.querySelector('.seed-text').textContent = seed;
      meta.querySelector('.model-text').textContent = model;

      const [copyBtn, downloadBtn, retryBtn, openBtn] = card.querySelectorAll('.actions button');

      copyBtn.onclick = () => copyToClipboard(`${prompt} (Seed: ${seed}, Model: ${model})`);
      downloadBtn.onclick = () => downloadImage(fullUrl, `${prompt.replace(/\s+/g, '_')}_${seed}.jpg`);
      retryBtn.onclick = () => {
        card.remove();
        generateImage();
      };
      openBtn.onclick = () => window.open(fullUrl, '_blank');

      img.onerror = () => {
        retryBtn.click();
      };

      grid.appendChild(card);
      generated++;

      if (infinite) setTimeout(generateImage, 1000);
      else if (generated < count) generateImage();
    }

    generateImage();
  });
}
