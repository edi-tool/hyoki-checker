/**
 * Word/PDF から得た断片を、表記チェックに適したプレーンテキストへ整える。
 * ブラウザと Node.js の簡易テストの両方から利用できる依存なしの関数群。
 */

/** @param {string} value */
function isLatinLike(value) {
  return /[A-Za-z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]$/u.test(
    value || "",
  );
}

/**
 * PDF.js の TextItem 配列を読みやすい1ページ分のテキストへ復元する。
 * 日本語の文字断片は直結し、欧文は座標上の空きがある場合だけ空白を補う。
 * @param {Array<{str?:string, hasEOL?:boolean, transform?:number[], width?:number, height?:number}>} items
 * @returns {string}
 */
function reconstructPDFPage(items) {
  let output = "";
  let previous = null;

  for (const item of items || []) {
    if (!item || typeof item.str !== "string") continue;
    const value = item.str;
    const x = Number(item.transform?.[4]);
    const y = Number(item.transform?.[5]);
    const height = Math.abs(Number(item.height || item.transform?.[3] || 0));

    if (previous && !output.endsWith("\n")) {
      const yTolerance = Math.max(
        2,
        Math.min(previous.height || height || 4, 12) * 0.55,
      );
      const changedLine =
        Number.isFinite(y) &&
        Number.isFinite(previous.y) &&
        Math.abs(y - previous.y) > yTolerance;

      if (changedLine) {
        output = output.trimEnd() + "\n";
      } else {
        const previousEnd = previous.x + previous.width;
        const gap =
          Number.isFinite(x) && Number.isFinite(previousEnd)
            ? x - previousEnd
            : 0;
        const spaceThreshold = Math.max(
          1.5,
          Math.min(previous.height || height || 8, 14) * 0.18,
        );
        const needsLatinSpace =
          gap > spaceThreshold &&
          isLatinLike(previous.value) &&
          /^[A-Za-z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/u.test(value);
        if (needsLatinSpace && !/\s$/.test(output) && !/^\s/.test(value))
          output += " ";
      }
    }

    output += value;
    if (item.hasEOL) output = output.trimEnd() + "\n";

    previous = {
      value,
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : NaN,
      width: Math.max(0, Number(item.width) || 0),
      height,
    };
  }

  return output.trim();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { reconstructPDFPage };
}
