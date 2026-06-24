const submitBtn = document.getElementById('submitBtn');
const nodeInput = document.getElementById('nodeInput');
const resultEl = document.getElementById('result');
const statusEl = document.getElementById('status');

function parseInput(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON input must be an array of strings.');
    }
    return parsed;
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function submitData() {
  statusEl.textContent = '';
  try {
    const data = parseInput(nodeInput.value);

    const response = await fetch('/bfhl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Request failed.');
    }

    resultEl.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    statusEl.textContent = error.message || 'Something went wrong.';
  }
}

submitBtn.addEventListener('click', submitData);
