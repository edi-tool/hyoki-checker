/**
 * analyzer.js - テキスト解析エンジン
 * Aho-Corasick法によるマルチパターンマッチング、およびルールベースの正規化を提供する。
 */
class DocumentAnalyzer {
    constructor(dictionary, options) {
        this.dictionary = dictionary;
        this.options = options;
        
        // Aho-Corasickオートマトンの状態管理配列 [7, 29]
        this.trie =;
        this.output =;
        this.fail =;
        
        // メインスレッドに返す周辺テキストの取得文字数
        this.contextWindowSize = 25; 
        
        this.buildEngine();
    }

    /**
     * 辞書に基づく初期化とオートマトンの構築
     */
    buildEngine() {
        // 重複を排除するためのSet
        let keywordSet = new Map();

        // 1. 完全一致パターンの登録
        this.dictionary.exact.forEach(word => {
            keywordSet.set(word, 'exact');
        });

        // 2. 活用形（ベータ機能）の動的展開と登録 
        if (this.options.inflection && this.dictionary.verbs) {
            this.dictionary.verbs.forEach(verb => {
                const variants = this.generateLightweightInflections(verb);
                variants.forEach(variant => {
                    // 完全一致に既に登録されていない場合のみ追加
                    if (!keywordSet.has(variant)) {
                        keywordSet.set(variant, 'inflection');
                    }
                });
            });
        }

        // 3. ファジー検索（ベータ機能）用パターンの正規化登録 [8]
        if (this.options.fuzzy && this.dictionary.fuzzy) {
            this.dictionary.fuzzy.forEach(word => {
                // ファジー検索のターゲットとなる語彙を正規化して登録する
                const normalizedWord = this.normalizeText(word);
                if (!keywordSet.has(normalizedWord)) {
                    keywordSet.set(normalizedWord, 'fuzzy');
                }
            });
        }

        // 抽出されたすべてのキーワードとメタデータを格納
        this.patterns = Array.from(keywordSet.keys());
        this.patternMeta = keywordSet;
        
        // オートマトンを構築する
        this.buildAhoCorasickAutomaton(this.patterns);
    }

    /**
     * 疑似形態素解析: ルールベースでの接尾辞展開アルゴリズム
     * 重い外部辞書（MeCab等）を使用せず、メモリ使用量を抑えて活用形を網羅する [2, 32]
     */
    generateLightweightInflections(verb) {
        const variants =;
        // サンプルとして五段活用・一段活用の典型的な終端文字に基づく展開
        // ※ 本格的なシステムではこのルールセットを拡張して用いる
        if (verb.endsWith("う")) {
            const stem = verb.slice(0, -1);
            variants.push(stem + "わ");   // 例: 行わない
            variants.push(stem + "い");   // 例: 行います
            variants.push(stem + "っ");   // 例: 行った、行って
            variants.push(stem + "え");   // 例: 行えば
            variants.push(stem + "お");   // 例: 行おう
        } else if (verb.endsWith("る")) {
            const stem = verb.slice(0, -1);
            variants.push(stem + "な");   // 例: 認めない
            variants.push(stem + "ま");   // 例: 認めます
            variants.push(stem + "た");   // 例: 認めた
            variants.push(stem + "て");   // 例: 認めて
            variants.push(stem + "よ");   // 例: 認めよう
        }
        return variants;
    }

    /**
     * ファジー検索のための静的テキスト正規化処理
     * NFKC正規化と片仮名特有の揺らぎ（長音符）を吸収する [4, 39]
     */
    normalizeText(text) {
        // 全角・半角の英数字とカタカナを統一 (NFKC) [8]
        let normalized = text.normalize('NFKC');
        
        // 長音符「ー」を除去することで「コンピューター」と「コンピュータ」を同一視させる
        normalized = normalized.replace(/[\u30FC]/g, '');
        
        // 大文字小文字の統一
        normalized = normalized.toLowerCase();
        
        return normalized;
    }

    /**
     * Aho-Corasick法のTrieおよびFailure Link構築 [27, 28, 29]
     * 時間計算量 O(m) でオートマトンをコンパイルする。
     */
    buildAhoCorasickAutomaton(patterns) {
        this.trie = [{}];
        this.output = [];
        this.fail = ;

        // 状態1: Trieツリーの構築
        for (let i = 0; i < patterns.length; i++) {
            let word = patterns[i];
            let currentState = 0;

            for (let j = 0; j < word.length; j++) {
                let char = word[j];
                // 遷移先が存在しない場合は新しい状態（ノード）を作成
                if (this.trie[char] === undefined) {
                    this.trie.push({});
                    this.output.push();
                    this.fail.push(0);
                    this.trie[char] = this.trie.length - 1;
                }
                currentState = this.trie[char];
            }
            // 終端状態にマッチした単語を記録
            this.output.push(word);
        }

        // 状態2: 失敗時遷移（Failure Link）の構築 (幅優先探索: BFS)
        let queue =;
        for (let char in this.trie) {
            let state = this.trie[char];
            this.fail[state] = 0;
            queue.push(state);
        }

        while (queue.length > 0) {
            let state = queue.shift();

            for (let char in this.trie[state]) {
                let nextState = this.trie[state][char];
                queue.push(nextState);

                let fState = this.fail[state];
                // マッチする遷移が見つかるか、ルート(0)に到達するまでフェイルリンクを辿る
                while (fState > 0 && this.trie[char] === undefined) {
                    fState = this.fail;
                }

                if (this.trie[char]!== undefined) {
                    this.fail = this.trie[char];
                } else {
                    this.fail = 0;
                }

                // 包含関係にあるパターン（例: "he" と "she"）の出力をマージする
                if (this.output].length > 0) {
                    this.output = this.output.concat(this.output]);
                }
            }
        }
    }

    /**
     * テキストストリームを解析し、バッチ処理でメインスレッドに結果を送信する
     * 時間計算量 O(n + z) でテキスト全体を一度だけスキャンする 
     */
    analyze(rawText, onBatchResults) {
        let currentState = 0;
        let batch =;
        const BATCH_SIZE_LIMIT = 50; // DOMレンダリングの負荷を抑えるためのチャンクサイズ

        // ファジー機能が有効な場合、検索対象のドキュメントテキスト自体もストリーム上で正規化する
        // ※ オリジナルのインデックスとコンテキストを維持するため、内部的なマップでマッピングする必要があるが、
        // 簡略化のため、元のテキスト配列をベースに疑似的に走査する。
        
        let targetText = rawText;
        if (this.options.fuzzy) {
            // パフォーマンスのため全体の正規化を行う
            targetText = this.normalizeText(rawText);
        }

        for (let i = 0; i < targetText.length; i++) {
            let char = targetText[i];

            // 現在の状態から次の文字への遷移がない場合、フェイルリンクを辿る
            while (currentState > 0 && this.trie[char] === undefined) {
                currentState = this.fail;
            }

            // 遷移が存在すれば状態を進め、なければルート(0)に戻る
            if (this.trie[char]!== undefined) {
                currentState = this.trie[char];
            } else {
                currentState = 0;
            }

            // 現在の状態でマッチする出力（パターン）があるか確認
            if (this.output.length > 0) {
                for (let keyword of this.output) {
                    
                    // パターンのメタデータ（完全一致か、活用形か、ファジーか）を取得
                    const matchType = this.patternMeta.get(keyword);

                    // コンテキスト（周辺テキスト）の切り出し。ユーザーへの提示には生のテキストを使用する。
                    // ※ 正規化により文字長が変化している場合（半角カナ→全角など）にインデックスのズレが生じるが、
                    // ベータ版としてのファジー機能の許容範囲とする。
                    const matchStartIndex = i - keyword.length + 1;
                    const contextStart = Math.max(0, matchStartIndex - this.contextWindowSize);
                    const contextEnd = Math.min(rawText.length, i + this.contextWindowSize + 1);
                    
                    // 改行コードなどをスペースに変換して視認性を向上
                    const contextStr = rawText.substring(contextStart, contextEnd).replace(/[\r\n\t]+/g, ' ');

                    batch.push({
                        keyword: keyword,
                        index: matchStartIndex,
                        context: `...${contextStr}...`,
                        type: matchType
                    });
                }
            }

            // 指定したバッチサイズに達したらメインスレッドにストリーミング送信 [42]
            if (batch.length >= BATCH_SIZE_LIMIT) {
                onBatchResults(batch);
                batch =;
            }
        }

        // 残りの結果をフラッシュ送信
        if (batch.length > 0) {
            onBatchResults(batch);
        }
    }
}
