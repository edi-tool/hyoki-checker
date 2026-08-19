/** 構造化ルールパック + localStorage カスタム辞書を管理する。 */
class DictionaryManager {
  constructor(storageKey = "hyoki_custom_dict", packKey = "hyoki_rule_packs") {
    this._key = storageKey;
    this._packKey = packKey;
  }

  /** 旧 string[] グループを安全側（confirm）で構造化する互換アダプター。 */
  normalizeRule(input, index = 0, pack = "custom") {
    if (Array.isArray(input)) {
      const variants = [
        ...new Set(
          input.filter((word) => typeof word === "string" && word.trim()),
        ),
      ];
      if (variants.length < 2) return null;
      return {
        id: `${pack}.legacy.${index + 1}`,
        type: "preferred",
        preferred: variants[0],
        variants,
        category: "legacy-custom",
        severity: "warning",
        fixMode: "confirm",
        reason: "旧配列形式から移行したルール。自動置換前に確認が必要です。",
        source: this._customSource(pack),
      };
    }
    if (!input || typeof input !== "object") return null;
    const variants = [
      ...new Set(
        (input.variants || []).filter(
          (word) => typeof word === "string" && word.trim(),
        ),
      ),
    ];
    if (variants.length === 0) return null;
    const type = input.type || "preferred";
    const preferred =
      input.preferred ?? (type === "preferred" ? variants[0] : null);
    return {
      id: input.id || `${pack}.imported.${index + 1}`,
      type,
      preferred,
      variants,
      category: input.category || "custom",
      severity: input.severity || "warning",
      fixMode: ["auto", "confirm", "none"].includes(input.fixMode)
        ? input.fixMode
        : "confirm",
      reason: input.reason || "ユーザーカスタムルール",
      source: input.source || this._customSource(pack),
      ...(input.pattern ? { pattern: input.pattern } : {}),
      ...(input.replacement ? { replacement: input.replacement } : {}),
      ...(input.mustEmpty ? { mustEmpty: input.mustEmpty } : {}),
    };
  }

  /** 選択中パックを優先順位順に重ね、語が重なる低優先ルールを除外する。 */
  getAll() {
    const customPack = {
      id: "custom",
      priority: 400,
      rules: this._loadCustom(),
    };
    const enabled = this._loadPackSettings();
    const packs = [
      customPack,
      ...this._packs().filter((pack) => enabled[pack.id]),
    ].sort((a, b) => b.priority - a.priority);
    const claimed = new Set();
    const merged = [];
    for (const pack of packs) {
      for (const rule of pack.rules || []) {
        const words = rule.variants || [];
        if (words.some((word) => claimed.has(word))) continue;
        merged.push(rule);
        words.forEach((word) => claimed.add(word));
      }
    }
    return merged;
  }

  getCustom() {
    return this._loadCustom();
  }

  getPackStates() {
    const enabled = this._loadPackSettings();
    return this._packs()
      .filter((pack) => !pack.hidden)
      .map((pack) => ({
        id: pack.id,
        label: pack.label,
        enabled: Boolean(enabled[pack.id]),
        ruleCount: pack.rules?.length || 0,
      }));
  }

  setPackEnabled(id, value) {
    const settings = this._loadPackSettings();
    settings[id] = Boolean(value);
    localStorage.setItem(this._packKey, JSON.stringify(settings));
  }

  addCustomGroup(words) {
    const custom = this._loadCustom();
    const rule = this.normalizeRule(words, custom.length, "custom");
    if (!rule) return;
    rule.id = `custom.${Date.now().toString(36)}`;
    rule.category = "custom";
    rule.reason = "ユーザーが登録した表記基準";
    custom.push(rule);
    this._saveCustom(custom);
  }

  removeCustomGroup(index) {
    const custom = this._loadCustom();
    custom.splice(index, 1);
    this._saveCustom(custom);
  }

  exportJSON() {
    const blob = new Blob([JSON.stringify(this._loadCustom(), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hyoki_custom_rules.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * prh (textlint-rule-prh) 形式の YAML をカスタム辞書へ取り込む。
   * @param {string} text - YAML テキスト
   * @param {{pack?: string, replace?: boolean, source?: object}} [options]
   * @returns {{added: number, skipped: object[], imports: string[]}}
   */
  importPRH(text, options = {}) {
    const prh = this._prh();
    if (!prh) throw new Error("prh モジュールが読み込まれていません");
    const pack = options.pack || "prh";
    const existing = options.replace ? [] : this._loadCustom();
    const { rules, skipped, imports } = prh.importPrhYAML(text, {
      pack: "custom",
      idPrefix: `custom.${pack}`,
      source: { ...this._customSource("custom"), title: `prh 辞書 (${pack})` },
    });
    const normalized = rules
      .map((rule, index) =>
        this.normalizeRule(rule, existing.length + index, "custom"),
      )
      .filter(Boolean);
    if (!normalized.length && !skipped.length) {
      throw new Error("prh ルールが見つかりません");
    }
    this._saveCustom([...existing, ...normalized]);
    return { added: normalized.length, skipped, imports };
  }

  /** カスタム辞書を prh 互換 YAML として書き出す（VS Code / CI へ持ち出す用）。 */
  exportPRH(filename = "hyoki_custom_rules.prh.yml") {
    const prh = this._prh();
    if (!prh) throw new Error("prh モジュールが読み込まれていません");
    const yaml = prh.rulesToPrhYAML(this._loadCustom());
    const blob = new Blob([yaml], { type: "text/yaml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  _prh() {
    if (typeof PRH !== "undefined") return PRH;
    if (typeof globalThis !== "undefined" && globalThis.PRH)
      return globalThis.PRH;
    return null;
  }

  async importJSON(file) {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error("ルール配列ではありません");
    const rules = data
      .map((item, index) => this.normalizeRule(item, index, "custom"))
      .filter(Boolean);
    if (rules.length !== data.length)
      throw new Error("変換できないルールが含まれています");
    this._saveCustom(rules);
  }

  importDelimited(text, separator = "\t") {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
    const existing = this._loadCustom();
    const additions = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const variants = line
        .split(separator)
        .map((value) => value.trim())
        .filter(Boolean);
      const rule = this.normalizeRule(
        variants,
        existing.length + additions.length,
        "custom",
      );
      if (rule) additions.push(rule);
    }
    this._saveCustom([...existing, ...additions]);
    return additions.length;
  }

  validateDict(rules) {
    const errors = [];
    (rules || []).forEach((rule, index) => {
      if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
        errors.push({ index, reason: "構造化ルールではありません" });
      } else if (
        !rule.id ||
        !rule.type ||
        !Array.isArray(rule.variants) ||
        !rule.variants.length
      ) {
        errors.push({ index, reason: "必須項目が不足しています" });
      } else if (rule.fixMode === "auto" && !rule.preferred) {
        errors.push({ index, reason: "autoルールにはpreferredが必要です" });
      } else if (
        ["contextual", "consistency"].includes(rule.type) &&
        rule.fixMode === "auto"
      ) {
        errors.push({ index, reason: `${rule.type}は自動置換できません` });
      }
    });
    return {
      valid: errors.length === 0,
      total: rules.length,
      validCount: rules.length - errors.length,
      errors,
    };
  }

  _packs() {
    return typeof DEFAULT_RULE_PACKS !== "undefined" ? DEFAULT_RULE_PACKS : [];
  }

  _loadPackSettings() {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(this._packKey)) || {};
    } catch {
      stored = {};
    }
    const settings = {};
    for (const pack of this._packs()) {
      settings[pack.id] =
        pack.id in stored
          ? Boolean(stored[pack.id])
          : Boolean(pack.defaultEnabled);
    }
    return settings;
  }

  _loadCustom() {
    let data = [];
    try {
      data = JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      return [];
    }
    if (!Array.isArray(data)) return [];
    const normalized = data
      .map((item, index) => this.normalizeRule(item, index, "custom"))
      .filter(Boolean);
    const migrated =
      data.some(Array.isArray) || normalized.length !== data.length;
    if (migrated) this._saveCustom(normalized);
    return normalized;
  }

  _saveCustom(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  }

  _customSource(pack) {
    return {
      pack,
      title: "ユーザーカスタム辞書",
      url: "",
      license: "user-provided",
      attribution: "user",
      retrievedAt: new Date().toISOString().slice(0, 10),
      modified: true,
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DictionaryManager };
}
