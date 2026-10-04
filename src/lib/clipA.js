export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return 'Copied.'; }
  catch (e) { return 'Copy blocked: select the text and copy it manually.'; }
}
