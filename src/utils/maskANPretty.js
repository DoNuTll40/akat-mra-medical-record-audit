   export default function maskANPretty (input, { keepStart = 2, keepEnd = 2, maskChar = "X" } = {}) {
    const chars = [...String(input ?? "")];
    // ใช้ Unicode properties ครอบคลุมทั้งเลขไทย ตัวอักษรต่างๆ
    const isWord = (ch) => /\p{L}|\p{N}/u.test(ch);

    const indices = [];
    for (let i = 0; i < chars.length; i++) if (isWord(chars[i])) indices.push(i);

    const total = indices.length;
    const startCut = Math.min(keepStart, total);
    const endCut = Math.min(keepEnd, Math.max(0, total - startCut));
    const toMask = indices.slice(startCut, total - endCut);

    for (const idx of toMask) chars[idx] = maskChar;
    return chars.join("");
  }