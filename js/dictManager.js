/** 辞書管理クラス（デフォルト辞書 + localStorage カスタム辞書を統合） */
class DictionaryManager {
  /** @param {string} storageKey - localStorageキー */
  constructor(storageKey = 'hyoki_custom_dict') {
    this._key = storageKey;
  }

  /** デフォルト + カスタム辞書を結合して返す */
  getAll() {
    return [...DEFAULT_DICT, ...this._loadCustom()];
  }

  /** カスタム辞書のみ返す */
  getCustom() {
    return this._loadCustom();
  }

  /**
   * カスタムグループを追加する
   * @param {string[]} words - 単語グループ（2語以上）
   */
  addCustomGroup(words) {
    if (!Array.isArray(words) || words.length < 2) return;
    const custom = this._loadCustom();
    custom.push(words);
    this._saveCustom(custom);
  }

  /**
   * カスタム辞書のエントリを削除する
   * @param {number} index - カスタム辞書内のインデックス
   */
  removeCustomGroup(index) {
    const custom = this._loadCustom();
    custom.splice(index, 1);
    this._saveCustom(custom);
  }

  /** カスタム辞書をJSONファイルとしてダウンロード（フェーズ2） */
  exportJSON() {
    const blob = new Blob([JSON.stringify(this._loadCustom(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hyoki_custom_dict.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * JSONファイルからカスタム辞書をインポート（フェーズ2）
   * @param {File} file
   */
  async importJSON(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('不正な形式です');
    this._saveCustom(data);
  }

  /**
   * TSV / CSV テキストをカスタム辞書にインポートする（追記）
   * 形式: A列=語A, B列=語B（片方が空の行はスキップ）
   * @param {string} text - ファイルテキスト
   * @param {string} sep - 区切り文字（デフォルト: タブ）
   * @returns {number} 追加されたグループ数
   */
  importDelimited(text, sep = '\t') {
    text = text.replace(/^\uFEFF/, ''); // BOM除去
    const lines = text.split(/\r?\n/);
    const groups = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(sep);
      const a = cols[0]?.trim();
      const b = cols[1]?.trim();
      if (a && b) groups.push([a, b]);
    }
    const existing = this._loadCustom();
    this._saveCustom([...existing, ...groups]);
    return groups.length;
  }

  /**
   * 辞書配列を検証して問題グループを報告する
   * @param {any[]} dict - 検証対象の辞書配列
   * @returns {{ valid: boolean, total: number, validCount: number, errors: {index: number, value: any, reason: string}[] }}
   */
  validateDict(dict) {
    const errors = [];
    dict.forEach((group, i) => {
      if (!Array.isArray(group)) {
        errors.push({ index: i, value: group, reason: 'グループが配列ではありません（カンマ漏れの可能性）' });
      } else if (group.length < 2) {
        errors.push({ index: i, value: group, reason: '単語が1語のみです（2語以上必要）' });
      } else {
        group.forEach((word, j) => {
          if (typeof word !== 'string' || word.trim() === '') {
            errors.push({ index: i, value: group, reason: `${j + 1}番目の単語が空か文字列ではありません` });
          }
        });
      }
    });
    return {
      valid: errors.length === 0,
      total: dict.length,
      validCount: dict.length - errors.length,
      errors,
    };
  }

  _loadCustom() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      return [];
    }
  }

  _saveCustom(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  }
}
