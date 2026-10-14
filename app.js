import { DEFAULT_COLOR, normalizeColor, recolorSvg, downloadName } from './model.js';

const grid = document.querySelector('#grid');
const picker = document.querySelector('#color');
const hex = document.querySelector('#hex');
const status = document.querySelector('#status');
const records = [];
let color = DEFAULT_COLOR;
let mode = 'vector';
let statusTimer;

function notify(message) {
  clearTimeout(statusTimer);
  status.textContent = message;
  status.classList.add('visible');
  statusTimer = setTimeout(() => status.classList.remove('visible'), 4000);
}

function refreshPreview(record) {
  if (!record.source) return;
  record.preview.replaceChildren();
  record.card.querySelector('.asset-type').textContent = mode === 'vector' ? 'VECTOR' : 'ORIGINAL';
  if (mode === 'original') {
    const image = new Image();
    image.src = record.member.original;
    image.alt = `${record.member.name} original generated icon`;
    image.loading = 'lazy';
    image.onerror = () => { record.preview.textContent = 'Original unavailable'; };
    record.preview.append(image);
  } else {
    record.preview.innerHTML = recolorSvg(record.source, color);
    const svg = record.preview.querySelector('svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${record.member.name} vector icon`);
  }
}

function setColor(value) {
  const normalized = normalizeColor(value);
  if (!normalized) return false;
  color = normalized;
  picker.value = normalized;
  hex.value = normalized;
  hex.setAttribute('aria-invalid', 'false');
  document.querySelector('#color-error').textContent = '';
  document.documentElement.style.setProperty('--icon-color', normalized);
  const rgb = [1, 3, 5].map(start => parseInt(normalized.slice(start, start + 2), 16));
  document.body.classList.toggle('light-ink', rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > 225);
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === normalized)));
  records.forEach(refreshPreview);
  return true;
}

function setMode(value) {
  mode = value;
  document.querySelector('#vector-mode').setAttribute('aria-pressed', String(value === 'vector'));
  document.querySelector('#original-mode').setAttribute('aria-pressed', String(value === 'original'));
  document.querySelectorAll('.color-tools input, .color-tools button').forEach(control => { control.disabled = value === 'original'; });
  records.forEach(refreshPreview);
}

function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function transparentPng(svg, size) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(image, 0, 0, size, size);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG export failed');
    return blob;
  } finally { URL.revokeObjectURL(url); }
}

async function download(record, format, button) {
  if (!record.source || button.disabled) return;
  button.disabled = true;
  const selectedColor = color;
  try {
    let blob, name;
    if (format === 'original') {
      const response = await fetch(record.member.original);
      if (!response.ok) throw new Error('Original unavailable');
      blob = await response.blob();
      name = `${record.member.id}-original.png`;
    } else {
      const svg = recolorSvg(record.source, selectedColor);
      blob = format === 'svg' ? new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }) : await transparentPng(svg, Number(document.querySelector('#size').value));
      name = downloadName(record.member.id, format, selectedColor);
    }
    save(blob, name);
    notify(`Downloaded ${name}`);
  } catch (error) {
    console.error(error);
    notify(`${record.member.name}: download failed. Please try again.`);
  } finally { button.disabled = false; }
}

async function loadAsset(record) {
  record.preview.textContent = 'Loading';
  try {
    const response = await fetch(record.member.svg);
    if (!response.ok) throw new Error('SVG unavailable');
    const source = await response.text();
    recolorSvg(source, color);
    record.source = source;
    refreshPreview(record);
    record.card.querySelectorAll('.download').forEach(button => { button.disabled = false; });
  } catch (error) {
    console.error(error);
    record.preview.replaceChildren();
    const retry = document.createElement('button');
    retry.className = 'retry';
    retry.textContent = 'Retry';
    retry.setAttribute('aria-label', `Retry loading ${record.member.name}`);
    retry.addEventListener('click', () => loadAsset(record));
    record.preview.append(retry);
  }
}

async function initialize() {
  const response = await fetch('members.json');
  if (!response.ok) throw new Error('Member list unavailable');
  const members = await response.json();
  document.querySelector('#count').textContent = `${members.length} members`;
  for (const member of members) {
    const card = document.createElement('article');
    card.className = 'member';
    card.dataset.member = member.id;
    card.innerHTML = `<div class="preview loading"></div><div class="member-meta"><div class="member-heading"><h2></h2><span class="asset-type">VECTOR</span></div><div class="downloads"></div></div>`;
    card.querySelector('h2').textContent = member.name;
    const record = { member, card, preview: card.querySelector('.preview'), source: null };
    for (const [format, label, title] of [['svg', 'SVG', 'Download recolored SVG'], ['png', 'PNG', 'Download recolored transparent PNG'], ['original', 'Original', 'Download original generated PNG']]) {
      const button = document.createElement('button');
      button.className = `download ${format}`;
      button.disabled = true;
      button.innerHTML = `<i data-lucide="download" aria-hidden="true"></i><span>${label}</span>`;
      button.title = title;
      button.setAttribute('aria-label', `${title} for ${member.name}`);
      button.addEventListener('click', () => download(record, format, button));
      card.querySelector('.downloads').append(button);
    }
    records.push(record);
    grid.append(card);
  }
  window.lucide?.createIcons();
  await Promise.all(records.map(loadAsset));
  grid.setAttribute('aria-busy', 'false');
}

picker.addEventListener('input', () => setColor(picker.value));
hex.addEventListener('input', () => {
  const valid = normalizeColor(hex.value);
  if (valid) setColor(valid);
  else hex.setAttribute('aria-invalid', 'true');
});
hex.addEventListener('change', () => {
  if (!setColor(hex.value)) document.querySelector('#color-error').textContent = 'Enter a 6-digit HEX color.';
});
hex.addEventListener('keydown', event => {
  if (event.key === 'Escape') setColor(color);
  if (event.key === 'Enter') hex.blur();
});
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => setColor(button.dataset.color)));
document.querySelector('#reset').addEventListener('click', () => setColor(DEFAULT_COLOR));
document.querySelector('#vector-mode').addEventListener('click', () => setMode('vector'));
document.querySelector('#original-mode').addEventListener('click', () => setMode('original'));
document.querySelector('#reload').addEventListener('click', () => location.reload());
initialize().catch(error => {
  console.error(error);
  grid.setAttribute('aria-busy', 'false');
  document.querySelector('#load-error').hidden = false;
});
