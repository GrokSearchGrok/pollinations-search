// script.js

const form = document.getElementById('genForm');
const resultsDiv = document.getElementById('results');

const modelSelect = document.getElementById('modelSelect');
fetch('https://image.pollinations.ai/models')
  .then(res => res.json())
  .then(models => {
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modelSelect.appendChild(opt);
    });
  });

form.addEventListener('submit', e => {
  e.preventDefault();

  const prompt = document.getElementById('prompt').value;
  const model = document.getElementById('modelSelect').value;
  const width = document.getElementById('width').value;
  const height = document.getElementById('height').value;
  const count = parseInt(document.getElementById('count').value);
  const enhance = document.getElementById('enhance').checked;
  const nologo = document.getElementById('nologo').checked;
  const safe = document.getElementById('safe').checked;
  const isPrivate = document.getElementById('private').checked;
  const infinite = document.getElementById('infinite').checked;

  let baseURL = 'https://image.pollinations.ai/prompt/';

  function generateUrl(seed) {
    const query = [];
    if (model) query.push(`model=${model}`);
    if (width) query.push(`width=${width}`);
    if (height) query.push(`height=${height}`);
    if (enhance) query.push('enhance=true');
    if (nologo) query.push('nologo=true');
    if (safe) query.push('filter=true');
    if (isPrivate) query.push('private=true');
    if (seed !== undefined) query.push(`seed=${seed}`);
    return `${baseURL}${encodeURIComponent(prompt)}?${query.join('&')}`;
  }

  let generated = 0;
  const max = infinite ? Infinity : count;

  function next(seedOverride) {
    if (generated >= max) return;
    const seed = seedOverride !== undefined ? seedOverride : Math.floor(Math.random() * 1000000);
    const url = generateUrl(seed);
    const img = document.createElement('img');
    img.src = url;
    img.alt = prompt;
    img.loading = 'lazy';

    const div = document.createElement('div');
    div.className = 'result-card';
    div.innerHTML = `<p><strong>Seed:</strong> ${seed}</p>`;
    div.appendChild(img);

    const btns = document.createElement('div');
    btns.className = 'card-buttons';
    btns.innerHTML = `
      <button onclick="window.open('${url}', '_blank')">🔗 Open</button>
      <button onclick="navigator.clipboard.writeText('${prompt} (seed ${seed})')">📋 Copy</button>
      <button onclick="location.href='${url}'" download="image-${seed}.jpg">⬇️ Download</button>
      <button onclick="retry(${seed})">♻️ Retry</button>`;
    div.appendChild(btns);

    resultsDiv.prepend(div);
    generated++;
    if (infinite) setTimeout(() => next(), 2000);
  }

  function retry(seed) {
    next(seed);
  }

  for (let i = 0; i < count; i++) {
    next();
  }
});

// Feed handlers
const imageFeed = new EventSource('https://image.pollinations.ai/feed');
imageFeed.onmessage = e => {
  const data = JSON.parse(e.data);
  const div = document.createElement('div');
  div.textContent = data.imageURL;
  document.getElementById('imageFeed').prepend(div);
};

const textFeed = new EventSource('https://text.pollinations.ai/feed');
textFeed.onmessage = e => {
  const data = JSON.parse(e.data);
  const div = document.createElement('div');
  div.textContent = data.text;
  document.getElementById('textFeed').prepend(div);
};
