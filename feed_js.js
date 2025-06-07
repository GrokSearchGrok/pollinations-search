// js/feed.js

// This script will be expanded if you include a live feed UI section in the future.
// For now it's a placeholder showing how you'd hook into the Pollinations feed.

function initImageFeed(targetElementId) {
  const eventSource = new EventSource('https://image.pollinations.ai/feed');
  const container = document.getElementById(targetElementId);

  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const img = document.createElement('img');
    img.src = data.imageURL;
    img.alt = data.prompt || 'Pollinations Image';
    img.loading = 'lazy';
    img.style.maxWidth = '100%';
    container.prepend(img);
  };
}

function initTextFeed(targetElementId) {
  const eventSource = new EventSource('https://text.pollinations.ai/feed');
  const container = document.getElementById(targetElementId);

  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const p = document.createElement('p');
    p.textContent = data.text || '[Text received]';
    container.prepend(p);
  };
}

// Usage:
// initImageFeed('imageFeedDiv');
// initTextFeed('textFeedDiv');
