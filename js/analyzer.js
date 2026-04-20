/**
 * analyzer.js - テキスト解析エンジン
 * Aho-Corasick法によるマルチパターンマッチング、およびルールベースの正規化を提供する。
 */
class DocumentAnalyzer {
    constructor(dictionary, options) {
        this.dictionary = dictionary;
        this.options = options;

        this.trie = [];
        this.output = [];
        this.fail = [];

        this.contextWindowSize = 25;

        this.buildEngine();
    }

    /**
     * 辞書に基づく初期化とオートマトンの構築
     */
    buildEngine() {
        const keywordSet = new Map();

        this.dictionary.exact.forEach(word => {
            keywordSet.set(word, 'exact');
        });

        if (this.options.inflection && this.dictionary.verbs) {
            this.dictionary.verbs.forEach(verb => {
                const variants = this.generateLightweightInflections(verb);
                variants.forEach(variant => {
                    if (!keywordSet.has(variant)) {
                        keywordSet.set(variant, 'inflection');
                    }
                });
            });
        }

        if (this.options.fuzzy && this.dictionary.fuzzy) {
            this.dictionary.fuzzy.forEach(word => {
                const normalizedWord = this.normalizeText(word);
                if (!keywordSet.has(normalizedWord)) {
                    keywordSet.set(normalizedWord, 'fuzzy');
                }
            });
        }

        this.patterns = Array.from(keywordSet.keys());
        this.patternMeta = keywordSet;

        this.buildAhoCorasickAutomaton(this.patterns);
    }

    /**
     * 疑似形態素解析: ルールベースでの接尾辞展開
     */
    generateLightweightInflections(verb) {
        const variants = [];
        if (verb.endsWith("う")) {
            const stem = verb.slice(0, -1);
            variants.push(stem + "わ", stem + "い", stem + "っ", stem + "え", stem + "お");
        } else if (verb.endsWith("る")) {
            const stem = verb.slice(0, -1);
            variants.push(stem + "な", stem + "ま", stem + "た", stem + "て", stem + "よ");
        }
        return variants;
    }

    /**
     * ファジー検索のための静的テキスト正規化（NFKC + 長音符除去 + 小文字統一）
     */
    normalizeText(text) {
        return text.normalize('NFKC').replace(/\u30FC/g, '').toLowerCase();
    }

    /**
     * Aho-Corasick オートマトン構築
     * this.trie[state][char] = nextState
     * this.output[state] = [matchedWord, ...]
     * this.fail[state] = failState
     */
    buildAhoCorasickAutomaton(patterns) {
        this.trie = [{}];
        this.output = [[]];
        this.fail = [0];

        // フェーズ1: Trie 構築
        for (const word of patterns) {
            let state = 0;
            for (const char of word) {
                if (this.trie[state][char] === undefined) {
                    this.trie.push({});
                    this.output.push([]);
                    this.fail.push(0);
                    this.trie[state][char] = this.trie.length - 1;
                }
                state = this.trie[state][char];
            }
            this.output[state].push(word);
        }

        // フェーズ2: 失敗リンク構築 (BFS)
        const queue = [];
        for (const char in this.trie[0]) {
            const state = this.trie[0][char];
            this.fail[state] = 0;
            queue.push(state);
        }

        while (queue.length > 0) {
            const state = queue.shift();
            for (const char in this.trie[state]) {
                const nextState = this.trie[state][char];
                queue.push(nextState);

                let fState = this.fail[state];
                while (fState > 0 && this.trie[fState][char] === undefined) {
                    fState = this.fail[fState];
                }

                this.fail[nextState] =
                    (this.trie[fState][char] !== undefined && this.trie[fState][char] !== nextState)
                        ? this.trie[fState][char]
                        : 0;

                this.output[nextState] = this.output[nextState].concat(
                    this.output[this.fail[nextState]]
                );
            }
        }
    }

    /**
     * テキストをスキャンし、バッチ単位でコールバックに結果を送信する
     */
    analyze(rawText, onBatchResults) {
        let state = 0;
        let batch = [];
        const BATCH_SIZE = 50;

        const targetText = this.options.fuzzy ? this.normalizeText(rawText) : rawText;

        for (let i = 0; i < targetText.length; i++) {
            const char = targetText[i];

            while (state > 0 && this.trie[state][char] === undefined) {
                state = this.fail[state];
            }

            if (this.trie[state][char] !== undefined) {
                state = this.trie[state][char];
            }

            if (this.output[state].length > 0) {
                for (const keyword of this.output[state]) {
                    const matchType = this.patternMeta.get(keyword);
                    const startIdx = i - keyword.length + 1;
                    const ctxStart = Math.max(0, startIdx - this.contextWindowSize);
                    const ctxEnd = Math.min(rawText.length, i + this.contextWindowSize + 1);
                    const contextStr = rawText.substring(ctxStart, ctxEnd).replace(/[\r\n\t]+/g, ' ');

                    batch.push({
                        keyword,
                        index: startIdx,
                        context: `...${contextStr}...`,
                        type: matchType
                    });
                }
            }

            if (batch.length >= BATCH_SIZE) {
                onBatchResults(batch);
                batch = [];
            }
        }

        if (batch.length > 0) {
            onBatchResults(batch);
        }
    }
}
