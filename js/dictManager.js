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
