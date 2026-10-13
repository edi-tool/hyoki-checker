/** GENERATED FILE. Edit rule pack sources and run npm run build:rules. */
const GENERATED_RULES = {
  "version": 1,
  "packs": [
    {
      "id": "company",
      "label": "新聞表記",
      "description": "既定の基準。平仮名で書く語・送り仮名・単位・教育用語など",
      "paths": [
        "packs/company/rules-01.json",
        "packs/company/rules-02.json",
        "packs/company/rules-03.json",
        "packs/company/rules-04.json",
        "packs/company/rules-05.json"
      ],
      "priority": 300,
      "defaultEnabled": true,
      "source": {
        "pack": "company",
        "title": "表記統一さん 既定辞書（新聞表記）",
        "url": "https://github.com/edi-tool/hyoki-checker",
        "license": "MIT",
        "attribution": "hyoki-checker contributors",
        "retrievedAt": "2026-07-14",
        "modified": true,
        "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
      },
      "rules": [
        {
          "reason": "補助動詞の「いく」は平仮名で書く。実際にその場所へ移動する意味の「行く」は漢字のままでよい。",
          "id": "company.0001",
          "type": "pattern",
          "preferred": "～ていく",
          "variants": [
            "～ていく",
            "～て行く"
          ],
          "pattern": "(?:(?<!やっ|持っ|連れ|帰っ|戻っ|入っ|走っ|歩い|買っ|取っ|借り|集まっ|出|見)て|(?<!飛|運|呼)んで)行(?=[かきくけこ])",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "補助動詞の「くる」は平仮名で書く。実際にこちらへ移動する意味の「来る」は漢字のままでよい。",
          "id": "company.0002",
          "type": "pattern",
          "preferred": "～てくる",
          "variants": [
            "～てくる",
            "～て来る"
          ],
          "pattern": "(?:(?<!やっ|持っ|連れ|帰っ|戻っ|入っ|走っ|歩い|買っ|取っ|借り|集まっ|出|見)て|(?<!飛|運|呼)んで)来(?=[るれたてなまいよず])",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「試しに～する」の意味の補助動詞「みる」は平仮名で書く。実際に目で見る意味なら漢字のままでよい。",
          "id": "company.0003",
          "type": "pattern",
          "preferred": "～てみる",
          "variants": [
            "～てみる",
            "～て見る"
          ],
          "pattern": "(?:やっ|考え|書い|試し|使っ|調べ|作っ|食べ|触っ|言っ|話し|聞い|読ん|解い|描い|歌っ|遊ん|数え|確かめ|取り組ん|挑戦し|体験し|実践し)[てで]見(?=[るたてなまよ])(?!た目)",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "補助動詞の「おく」は平仮名で書く。実際に物を置く意味なら漢字のままでよい。",
          "id": "company.0004",
          "type": "pattern",
          "preferred": "～ておく",
          "variants": [
            "～ておく",
            "～て置く"
          ],
          "pattern": "(?:覚え|考え|決め|言っ|知っ|伝え|調べ|読ん|やっ|見|聞い|押さえ|踏まえ|準備し|用意し|確認し|予習し|復習し|把握し|理解し|整理し|共有し|説明し|連絡し|記録し)[てで]置(?=[かきくけこい])",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "補助動詞の「しまう」は平仮名で書く。",
          "id": "company.0005",
          "type": "pattern",
          "preferred": "～てしまう",
          "variants": [
            "～てしまう",
            "～て仕舞う"
          ],
          "pattern": "(?:て|んで)仕舞(?=[わいうえおっ])",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「かもしれない」は平仮名で書く。",
          "id": "company.0006",
          "type": "pattern",
          "preferred": "～かもしれない",
          "variants": [
            "～かもしれない",
            "～かも知れない"
          ],
          "pattern": "かも知れ",
          "replacement": "かもしれ",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "形式名詞の「ため」は平仮名で書く（行為・為替などの語は対象外）。",
          "id": "company.0007",
          "type": "pattern",
          "preferred": "ため",
          "variants": [
            "ため",
            "為"
          ],
          "pattern": "(?<=\\p{sc=Hiragana})為(?![すしさせ替る])",
          "replacement": "ため",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～の場合」の意味の形式名詞は「とき」と書く。時点・時刻そのものを指す場合は「時」のままでよい。",
          "id": "company.0008",
          "type": "pattern",
          "preferred": "とき",
          "variants": [
            "とき",
            "時"
          ],
          "pattern": "(?<=[るたいだなのうくすつぬむぶぐ])時(?=[にはもの、。でだ]|まで|から|こそ|など|って|$)",
          "replacement": "とき",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "形式名詞の「ところ」は平仮名で書く。具体的な場所を指す場合は「所」のままでよい。",
          "id": "company.0009",
          "type": "pattern",
          "preferred": "ところ",
          "variants": [
            "ところ",
            "所"
          ],
          "pattern": "(?<=[たるいだ])所(?=[、。でがにはをもだ])",
          "replacement": "ところ",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "接続詞の「ゆえに」は平仮名で書く（事故・縁故などの語は対象外）。",
          "id": "company.0010",
          "type": "pattern",
          "preferred": "ゆえに",
          "variants": [
            "ゆえに",
            "故に"
          ],
          "pattern": "(?<!\\p{sc=Han})故に",
          "replacement": "ゆえに",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～のとおり」「～したとおり」は平仮名で書く。道の意味の「通り」は漢字のままでよい。",
          "id": "company.0011",
          "type": "pattern",
          "preferred": "とおり",
          "variants": [
            "とおり",
            "通り"
          ],
          "pattern": "(?<=[のたるう])通り(?![\\p{sc=Han}ぬすがかま])",
          "replacement": "とおり",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "接尾語の「ごと」は平仮名で書く（毎日・毎回などの語は対象外）。",
          "id": "company.0012",
          "type": "pattern",
          "preferred": "ごと",
          "variants": [
            "ごと",
            "毎"
          ],
          "pattern": "(?<=[\\p{sc=Han}\\p{sc=Hiragana}\\p{sc=Katakana}0-9０-９ー])毎(?=[にの、。])",
          "replacement": "ごと",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0013",
          "type": "preferred",
          "preferred": "よろしく",
          "variants": [
            "よろしく",
            "宜しく"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "補助動詞の「いたす」は平仮名で書く（一致・合致などの語は対象外）。",
          "id": "company.0014",
          "type": "pattern",
          "preferred": "いたします",
          "variants": [
            "いたします",
            "致します"
          ],
          "pattern": "(?<![一合招誘拉馴極筆風雅])致(しま(?:す|した|して|せん)|して|し|す|さ|せ)",
          "replacement": "いた$1",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0015",
          "type": "preferred",
          "preferred": "いただく",
          "variants": [
            "いただく",
            "頂く"
          ],
          "inflect": "godan-ku",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0016",
          "type": "preferred",
          "preferred": "ください",
          "variants": [
            "ください",
            "下さい"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0017",
          "type": "preferred",
          "preferred": "誠に",
          "variants": [
            "誠に",
            "まことに"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0018",
          "type": "preferred",
          "preferred": "おかげさまで",
          "variants": [
            "おかげさまで",
            "お陰様で",
            "お蔭様で"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0019",
          "type": "preferred",
          "preferred": "および",
          "variants": [
            "および",
            "及び"
          ],
          "exceptions": [
            "及びま",
            "及び腰",
            "及びもつ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0020",
          "type": "preferred",
          "preferred": "または",
          "variants": [
            "または",
            "又は"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0021",
          "type": "preferred",
          "preferred": "かつ",
          "variants": [
            "かつ",
            "且つ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "接続詞の「したがって」は平仮名で書く。動詞の「～に従って」は対象外。",
          "id": "company.0022",
          "type": "pattern",
          "preferred": "したがって",
          "variants": [
            "したがって",
            "従って"
          ],
          "pattern": "(?<!に)従って",
          "replacement": "したがって",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0023",
          "type": "preferred",
          "preferred": "ならびに",
          "variants": [
            "ならびに",
            "並びに"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0024",
          "type": "preferred",
          "preferred": "なぜ",
          "variants": [
            "なぜ",
            "何故"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "副詞の「ぜひ」は平仮名で書く。名詞の「是非（を問う）」は対象外。",
          "id": "company.0025",
          "type": "pattern",
          "preferred": "ぜひ",
          "variants": [
            "ぜひ",
            "是非"
          ],
          "pattern": "是非(?![をのがはにも論])",
          "replacement": "ぜひ",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0026",
          "type": "preferred",
          "preferred": "あらかじめ",
          "variants": [
            "あらかじめ",
            "予め"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0027",
          "type": "preferred",
          "preferred": "かつて",
          "variants": [
            "かつて",
            "嘗て"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0028",
          "type": "preferred",
          "preferred": "すでに",
          "variants": [
            "すでに",
            "既に"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0029",
          "type": "preferred",
          "preferred": "まず",
          "variants": [
            "まず",
            "先ず"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "副詞の「さらに」は平仮名で書く（「変更に」などは対象外）。",
          "id": "company.0030",
          "type": "pattern",
          "preferred": "さらに",
          "variants": [
            "さらに",
            "更に"
          ],
          "pattern": "(?<!\\p{sc=Han})更に",
          "replacement": "さらに",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0031",
          "type": "preferred",
          "preferred": "すべて",
          "variants": [
            "すべて",
            "全て"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0032",
          "type": "preferred",
          "preferred": "ほとんど",
          "variants": [
            "ほとんど",
            "殆ど"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0033",
          "type": "preferred",
          "preferred": "いまだ",
          "variants": [
            "いまだ",
            "未だ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0034",
          "type": "preferred",
          "preferred": "きわめて",
          "variants": [
            "きわめて",
            "極めて"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0035",
          "type": "preferred",
          "preferred": "できる",
          "variants": [
            "できる",
            "出来る"
          ],
          "inflect": "ichidan",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0037",
          "type": "preferred",
          "preferred": "わかる",
          "variants": [
            "わかる",
            "分かる",
            "分る",
            "判る",
            "解る"
          ],
          "inflect": "godan-ru",
          "exceptions": [
            "分かれる",
            "分かれて",
            "分かれた",
            "分かれま",
            "分かれな",
            "分かれ目",
            "分かれ道",
            "分かれ、",
            "分れ",
            "自分",
            "半分",
            "気分",
            "部分",
            "多分",
            "十分",
            "随分",
            "大分",
            "何分",
            "存分",
            "当分",
            "幾分",
            "余分",
            "時分",
            "性分",
            "身分",
            "処分",
            "親分",
            "子分",
            "水分",
            "成分",
            "養分",
            "塩分",
            "糖分",
            "節分",
            "等分",
            "配分",
            "区分",
            "通分",
            "約分",
            "言い分",
            "取り分"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0038",
          "type": "preferred",
          "preferred": "よい",
          "variants": [
            "よい",
            "良い",
            "好い",
            "善い"
          ],
          "inflect": "i-adj",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0039",
          "type": "preferred",
          "preferred": "よさ",
          "variants": [
            "よさ",
            "良さ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "興味・関心・自信・考えなど抽象的なものには「もつ」を使う。物を手に持つ場合は「持つ」のままでよい。",
          "id": "company.0040",
          "type": "preferred",
          "preferred": "もつ",
          "variants": [
            "もつ",
            "持つ"
          ],
          "inflect": "godan-tsu",
          "exceptions": [
            "気持ち",
            "持ち物",
            "持ち味",
            "持ち主",
            "持ち場",
            "持ち前",
            "持ち手",
            "持ち方",
            "持ち時間",
            "持ち帰",
            "持ち上",
            "持ち込",
            "持ち運",
            "持ち出",
            "持ち寄",
            "持ち回",
            "持ち越",
            "持ち合",
            "持ち歩",
            "持ちこた",
            "金持ち",
            "力持ち",
            "手持ち",
            "長持ち",
            "面持ち",
            "心持ち",
            "日持ち",
            "受け持",
            "取り持",
            "掛け持",
            "子持ち",
            "所持"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0041",
          "type": "preferred",
          "preferred": "ない",
          "variants": [
            "ない",
            "無い"
          ],
          "inflect": "i-adj",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0042",
          "type": "preferred",
          "preferred": "十分",
          "variants": [
            "十分",
            "充分"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0043",
          "type": "preferred",
          "preferred": "いえる",
          "variants": [
            "いえる",
            "言える"
          ],
          "inflect": "ichidan",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0044",
          "type": "preferred",
          "preferred": "表す",
          "variants": [
            "表す",
            "表わす"
          ],
          "inflect": "godan-su",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0045",
          "type": "preferred",
          "preferred": "現れる",
          "variants": [
            "現れる",
            "現われる"
          ],
          "inflect": "ichidan-any",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0046",
          "type": "preferred",
          "preferred": "断る",
          "variants": [
            "断る",
            "断わる"
          ],
          "inflect": "godan-ru",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0047",
          "type": "preferred",
          "preferred": "終わる",
          "variants": [
            "終わる",
            "終る"
          ],
          "inflect": "godan-ru",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0048",
          "type": "preferred",
          "preferred": "変わる",
          "variants": [
            "変わる",
            "変る"
          ],
          "inflect": "godan-ru",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0049",
          "type": "preferred",
          "preferred": "代わる",
          "variants": [
            "代わる",
            "代る"
          ],
          "inflect": "godan-ru",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0050",
          "type": "preferred",
          "preferred": "行う",
          "variants": [
            "行う",
            "行なう",
            "おこなう"
          ],
          "inflect": "godan-u",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0051",
          "type": "preferred",
          "preferred": "落とす",
          "variants": [
            "落とす",
            "落す"
          ],
          "inflect": "godan-su",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0052",
          "type": "preferred",
          "preferred": "暮らす",
          "variants": [
            "暮らす",
            "暮す"
          ],
          "inflect": "godan-su",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0053",
          "type": "preferred",
          "preferred": "もとづく",
          "variants": [
            "もとづく",
            "基づく"
          ],
          "inflect": "godan-ku",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0054",
          "type": "preferred",
          "preferred": "もとに",
          "variants": [
            "もとに",
            "基に"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "数に続く「かげつ」は「か月」と書く。",
          "id": "company.0055",
          "type": "pattern",
          "preferred": "か月",
          "variants": [
            "か月",
            "カ月",
            "ヶ月",
            "箇月",
            "ケ月",
            "ヵ月"
          ],
          "pattern": "(?<=[0-9０-９一二三四五六七八九十百千数何幾])[カヶケヵ箇個]月",
          "replacement": "か月",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "数に続く「かこく」は「か国」と書く。",
          "id": "company.0056",
          "type": "pattern",
          "preferred": "か国",
          "variants": [
            "か国",
            "カ国",
            "ヶ国",
            "箇国",
            "ケ国"
          ],
          "pattern": "(?<=[0-9０-９一二三四五六七八九十百千数何幾])[カヶケヵ箇個]国",
          "replacement": "か国",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "数に続く「かしょ」は「か所」と書く。「該当箇所」のような名詞の「箇所」は対象外。",
          "id": "company.0057",
          "type": "pattern",
          "preferred": "か所",
          "variants": [
            "か所",
            "カ所",
            "ヶ所",
            "箇所",
            "ケ所"
          ],
          "pattern": "(?<=[0-9０-９一二三四五六七八九十百千数何幾])[カヶケヵ箇個]所",
          "replacement": "か所",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0058",
          "type": "preferred",
          "preferred": "パーセント",
          "variants": [
            "パーセント",
            "%",
            "％"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "数に続く「かねん」は「か年」と書く。",
          "id": "company.0059",
          "type": "pattern",
          "preferred": "か年",
          "variants": [
            "か年",
            "ヵ年",
            "ヶ年",
            "カ年",
            "箇年"
          ],
          "pattern": "(?<=[0-9０-９一二三四五六七八九十百千数何幾])[カヶケヵ箇個]年",
          "replacement": "か年",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "横書きで個数を数える場合は算用数字を使う。「一つ」は慣用的な表現（一つ一つ、何一つ など）が多いため対象外。",
          "id": "company.0060",
          "type": "pattern",
          "preferred": "２つ、３つ（算用数字）",
          "variants": [
            "２つ、３つ",
            "二つ、三つ"
          ],
          "pattern": "(?<!\\p{sc=Han})[二三四五六七八九]つ(?=[の、。をがはにでもとず目]|$)",
          "category": "legacy",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "横書きで人数を数える場合は算用数字を使う。「一人」は慣用的な表現（一人一人、一人で など）が多いため対象外。",
          "id": "company.0061",
          "type": "pattern",
          "preferred": "２人、３人（算用数字）",
          "variants": [
            "２人、３人",
            "二人、三人"
          ],
          "pattern": "(?<!\\p{sc=Han})[二三四五六七八九十]人(?=[の、。をがはにでもとず]|ずつ|組|$)",
          "category": "legacy",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0062",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "子ども",
            "こども",
            "子供",
            "児童"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0063",
          "type": "preferred",
          "preferred": "子どもたち",
          "variants": [
            "子どもたち",
            "子ども達",
            "子供たち",
            "子供達"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0064",
          "type": "preferred",
          "preferred": "一人一人",
          "variants": [
            "一人一人",
            "一人ひとり",
            "ひとりひとり"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0065",
          "type": "preferred",
          "preferred": "一つ一つ",
          "variants": [
            "一つ一つ",
            "一つひとつ",
            "ひとつひとつ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0066",
          "type": "preferred",
          "preferred": "在り方",
          "variants": [
            "在り方",
            "あり方"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0067",
          "type": "preferred",
          "preferred": "当たって",
          "variants": [
            "当たって",
            "あたって",
            "当って"
          ],
          "exceptions": [
            "さしあたって"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0068",
          "type": "preferred",
          "preferred": "付ける",
          "variants": [
            "付ける",
            "つける"
          ],
          "inflect": "ichidan",
          "exceptions": [
            "身につけ",
            "くっつけ",
            "やっつけ",
            "かこつけ",
            "こじつけ",
            "しつけ",
            "かけつけ",
            "ぶつけ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0069",
          "type": "preferred",
          "preferred": "気付く",
          "variants": [
            "気付く",
            "気づく"
          ],
          "inflect": "godan-ku",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0070",
          "type": "preferred",
          "preferred": "身に付ける",
          "variants": [
            "身に付ける",
            "身につける"
          ],
          "inflect": "ichidan-any",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0071",
          "type": "preferred",
          "preferred": "し合う",
          "variants": [
            "し合う",
            "しあう"
          ],
          "inflect": "godan-u",
          "exceptions": [
            "しあわせ",
            "しあさって"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0072",
          "type": "preferred",
          "preferred": "通して",
          "variants": [
            "通して",
            "とおして"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0073",
          "type": "preferred",
          "preferred": "我が国",
          "variants": [
            "我が国",
            "わが国"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0074",
          "type": "preferred",
          "preferred": "取り組み",
          "variants": [
            "取り組み",
            "取組",
            "取組み"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0075",
          "type": "preferred",
          "preferred": "話し合い",
          "variants": [
            "話し合い",
            "話合い"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0076",
          "type": "preferred",
          "preferred": "関わる",
          "variants": [
            "関わる",
            "かかわる",
            "係わる"
          ],
          "inflect": "godan-ru",
          "exceptions": [
            "にもかかわらず",
            "にかかわらず"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0077",
          "type": "preferred",
          "preferred": "育む",
          "variants": [
            "育む",
            "はぐくむ"
          ],
          "inflect": "godan-mu",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0078",
          "type": "preferred",
          "preferred": "踏まえる",
          "variants": [
            "踏まえる",
            "ふまえる"
          ],
          "inflect": "ichidan-any",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0079",
          "type": "preferred",
          "preferred": "目指す",
          "variants": [
            "目指す",
            "めざす"
          ],
          "inflect": "godan-su",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0080",
          "type": "preferred",
          "preferred": "友達",
          "variants": [
            "友達",
            "友だち"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0081",
          "type": "preferred",
          "preferred": "手立て",
          "variants": [
            "手立て",
            "てだて"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0082",
          "type": "preferred",
          "preferred": "働き",
          "variants": [
            "働き",
            "はたらき"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0083",
          "type": "preferred",
          "preferred": "振り返る",
          "variants": [
            "振り返る",
            "ふり返る",
            "ふりかえる"
          ],
          "inflect": "godan-ru",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0084",
          "type": "preferred",
          "preferred": "繰り返し",
          "variants": [
            "繰り返し",
            "くりかえし",
            "くり返し",
            "繰返し"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0085",
          "type": "preferred",
          "preferred": "見取る",
          "variants": [
            "見取る",
            "見とる"
          ],
          "inflect": "godan-ru",
          "exceptions": [
            "見とれ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0086",
          "type": "preferred",
          "preferred": "様々",
          "variants": [
            "様々",
            "さまざま"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0087",
          "type": "preferred",
          "preferred": "例えば",
          "variants": [
            "例えば",
            "たとえば"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0088",
          "type": "preferred",
          "preferred": "生かす",
          "variants": [
            "生かす",
            "いかす",
            "活かす"
          ],
          "inflect": "godan-su",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0089",
          "type": "preferred",
          "preferred": "皆",
          "variants": [
            "皆",
            "みんな"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0090",
          "type": "preferred",
          "preferred": "とらえる",
          "variants": [
            "とらえる",
            "捉える"
          ],
          "inflect": "ichidan-any",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "形式名詞の「こと」は平仮名で書く（大事・食事・仕事などの語は対象外）。",
          "id": "company.0091",
          "type": "pattern",
          "preferred": "こと",
          "variants": [
            "こと",
            "事"
          ],
          "pattern": "(?<=[るたいうくすつぬむぶぐなのだ])(?<!習い|願い|笑い|争い|祝い|占い)事(?=[がをはにもでと、。]|です|だ|な[のど]|$)",
          "replacement": "こと",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "動詞は「見いだす」と書く。名詞の「見出し（みだし）」は対象外。",
          "id": "company.0092",
          "type": "pattern",
          "preferred": "見いだす",
          "variants": [
            "見いだす",
            "見出す"
          ],
          "pattern": "見出(す|せ|そ|さ|し(?=[たてま]))",
          "replacement": "見いだ$1",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0093",
          "type": "preferred",
          "preferred": "ねらい",
          "variants": [
            "ねらい",
            "狙い"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0094",
          "type": "preferred",
          "preferred": "声かけ",
          "variants": [
            "声かけ",
            "声掛け"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0095",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "諸感覚",
            "五感"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0096",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "保育所",
            "保育園"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0097",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "教師",
            "先生",
            "教員"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0098",
          "type": "preferred",
          "preferred": "児童生徒",
          "variants": [
            "児童生徒",
            "児童・生徒"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0099",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "ICT端末",
            "一人一台端末"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0100",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "保護者",
            "お家の方",
            "親御さん",
            "父母",
            "父兄"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0101",
          "type": "preferred",
          "preferred": "つまずく",
          "variants": [
            "つまずく",
            "躓く",
            "つまづく"
          ],
          "inflect": "godan-ku",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0102",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "ふり返り",
            "振り返り",
            "リフレクション"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0103",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "見取り",
            "評価",
            "アセスメント"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0104",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "板書",
            "黒板書き"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0105",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "机間指導",
            "机間巡視"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0106",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "学習指導案",
            "指導案",
            "本案",
            "略案"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0107",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "働きかけ",
            "働き掛け",
            "アプローチ"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0108",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "特別支援教育",
            "特支"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0109",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "学級経営",
            "クラス運営",
            "クラス経営"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0110",
          "type": "preferred",
          "preferred": "送り仮名",
          "variants": [
            "送り仮名",
            "送りがな"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0111",
          "type": "preferred",
          "preferred": "ふりがな",
          "variants": [
            "ふりがな",
            "ルビ",
            "振り仮名"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0112",
          "type": "preferred",
          "preferred": "書き順",
          "variants": [
            "書き順",
            "筆順"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0113",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "物語文",
            "お話",
            "文学的な文章"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0114",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "説明文",
            "説明的な文章"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0115",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "指示語",
            "こそあど言葉"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。",
          "id": "company.0116",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "接続語",
            "つなぎの言葉"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0117",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "修飾語",
            "くわしくする言葉"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0118",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "原稿用紙",
            "作文用紙"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0119",
          "type": "preferred",
          "preferred": "ローマ字",
          "variants": [
            "ローマ字",
            "ローマ字書き"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0120",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "漢字",
            "かん字"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0121",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "足し算",
            "たし算",
            "加法"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0122",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "引き算",
            "ひき算",
            "減法"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0123",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "掛け算",
            "かけ算",
            "乗法"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0124",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "割り算",
            "わり算",
            "除法"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0125",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "筆算",
            "ひっ算"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0126",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "繰り上がり",
            "くり上がり",
            "くりあがり"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0127",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "繰り下がり",
            "くり下がり",
            "くりさがり"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0128",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "文章題",
            "文章問題",
            "応用問題"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0129",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "図形",
            "かたち"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "学年の配当漢字や発達段階に合わせて使い分ける語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0130",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "立体",
            "はこのかたち"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0131",
          "type": "pattern",
          "preferred": "リットル",
          "variants": [
            "リットル",
            "L",
            "l",
            "ℓ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)[LlℓＬｌ](?![A-Za-zＡ-Ｚａ-ｚ0-9-])",
          "replacement": "リットル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0132",
          "type": "pattern",
          "preferred": "デシリットル",
          "variants": [
            "デシリットル",
            "dL",
            "dl"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:dL|dl|ｄＬ|㎗)(?![A-Za-z])",
          "replacement": "デシリットル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0133",
          "type": "pattern",
          "preferred": "ミリリットル",
          "variants": [
            "ミリリットル",
            "mL",
            "ml"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:mL|ml|ｍＬ|㎖)(?![A-Za-z])",
          "replacement": "ミリリットル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0134",
          "type": "pattern",
          "preferred": "センチメートル",
          "variants": [
            "センチメートル",
            "cm",
            "センチ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:cm|ｃｍ|㎝|センチ(?![ァ-ヶー]))(?![A-Za-z])",
          "replacement": "センチメートル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0135",
          "type": "pattern",
          "preferred": "ミリメートル",
          "variants": [
            "ミリメートル",
            "mm",
            "ミリ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:mm|ｍｍ|㎜|ミリ(?![ァ-ヶー]))(?![A-Za-z])",
          "replacement": "ミリメートル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0136",
          "type": "pattern",
          "preferred": "キロメートル",
          "variants": [
            "キロメートル",
            "km"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:km|ｋｍ|㎞)(?![A-Za-z])",
          "replacement": "キロメートル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0137",
          "type": "pattern",
          "preferred": "グラム",
          "variants": [
            "グラム",
            "g",
            "ｇ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)[gｇ](?![A-Za-zＡ-Ｚａ-ｚ0-9])",
          "replacement": "グラム",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0138",
          "type": "pattern",
          "preferred": "キログラム",
          "variants": [
            "キログラム",
            "kg",
            "ｋｇ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:kg|ｋｇ|㎏)(?![A-Za-z])",
          "replacement": "キログラム",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "単位記号は数字の直後にあるものだけを対象にする（英単語の一部は対象外）。",
          "id": "company.0139",
          "type": "pattern",
          "preferred": "平方メートル",
          "variants": [
            "平方メートル",
            "m2",
            "㎡",
            "平米"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)(?:m2|m²|㎡|ｍ２|平米)",
          "replacement": "平方メートル",
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0140",
          "type": "preferred",
          "preferred": "マーケティング",
          "variants": [
            "マーケティング",
            "マーケッティング"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0141",
          "type": "preferred",
          "preferred": "プレゼンテーション",
          "variants": [
            "プレゼンテーション",
            "プレゼンション",
            "プレゼン"
          ],
          "exceptions": [
            "プレゼント",
            "プレゼンス",
            "プレゼンター"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0142",
          "type": "preferred",
          "preferred": "コンサルタント",
          "variants": [
            "コンサルタント",
            "コンサルタンド"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0143",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "売り上げ",
            "売上げ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0144",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "買い上げ",
            "買上げ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0146",
          "type": "preferred",
          "preferred": "割合",
          "variants": [
            "割合",
            "割合い"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0147",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "組み合わせ",
            "組合せ",
            "組み合せ",
            "組合わせ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0148",
          "type": "preferred",
          "preferred": "取扱説明書",
          "variants": [
            "取扱説明書",
            "取り扱い説明書",
            "取扱い説明書"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "指す会社や場面が異なる語。機械的には統一せず、混在している場合だけ知らせる。",
          "id": "company.0149",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "弊社",
            "当社",
            "自社"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "書き言葉（貴社）と話し言葉（御社）で使い分ける語。混在している場合だけ知らせる。",
          "id": "company.0150",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "貴社",
            "御社"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0151",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "引っ越し",
            "引越し"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0152",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "見積もり",
            "見積り"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0153",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "振り込み",
            "振込み"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0154",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "申し込み",
            "申込み"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "場所・係を指す「受付」と、動作を指す「受け付け」で使い分けることがある。混在している場合だけ知らせる。",
          "id": "company.0155",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "受付",
            "受け付け",
            "受付け"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0156",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "打ち合わせ",
            "打合せ",
            "打ち合せ",
            "打合わせ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0157",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "問い合わせ",
            "問合せ",
            "問い合せ",
            "問合わせ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0158",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "取り扱い",
            "取扱い"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0159",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "手続き",
            "手続"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "送り仮名の付け方に複数の慣用があるため統一先は決めず、文書内での混在だけを知らせる。",
          "id": "company.0160",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "届け出",
            "届出"
          ],
          "exceptions": [
            "届け出る",
            "届け出て",
            "届け出た",
            "届け出な",
            "届け出ま"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0161",
          "type": "preferred",
          "preferred": "サーバー",
          "variants": [
            "サーバー",
            "サーバ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0162",
          "type": "preferred",
          "preferred": "コンピューター",
          "variants": [
            "コンピューター",
            "コンピュータ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0163",
          "type": "preferred",
          "preferred": "ユーザー",
          "variants": [
            "ユーザー",
            "ユーザ"
          ],
          "exceptions": [
            "ユーザビリティ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0164",
          "type": "preferred",
          "preferred": "プリンター",
          "variants": [
            "プリンター",
            "プリンタ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0165",
          "type": "preferred",
          "preferred": "ルーター",
          "variants": [
            "ルーター",
            "ルータ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0166",
          "type": "preferred",
          "preferred": "モニター",
          "variants": [
            "モニター",
            "モニタ"
          ],
          "exceptions": [
            "モニタリング"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0167",
          "type": "preferred",
          "preferred": "スキャナー",
          "variants": [
            "スキャナー",
            "スキャナ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0168",
          "type": "preferred",
          "preferred": "フォルダー",
          "variants": [
            "フォルダー",
            "フォルダ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0169",
          "type": "preferred",
          "preferred": "アダプター",
          "variants": [
            "アダプター",
            "アダプタ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0170",
          "type": "preferred",
          "preferred": "プロセッサー",
          "variants": [
            "プロセッサー",
            "プロセッサ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0171",
          "type": "preferred",
          "preferred": "センサー",
          "variants": [
            "センサー",
            "センサ"
          ],
          "exceptions": [
            "センサス"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "",
          "id": "company.0172",
          "type": "preferred",
          "preferred": "ブラウザー",
          "variants": [
            "ブラウザー",
            "ブラウザ"
          ],
          "category": "legacy",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "名詞に付く「～どおり」は平仮名で書く。",
          "id": "company.0173",
          "type": "pattern",
          "preferred": "～どおり",
          "variants": [
            "～どおり",
            "～通り"
          ],
          "pattern": "(思い|予定|従来|文字|時間|計画|元|普段|ふだん|いつも|今まで|これまで|指示|期待|予想|希望|約束|予告|例年|注文|命令|理論|規定|手順|設計|想定)通り",
          "replacement": "$1どおり",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「キロ」だけでは長さ（キロメートル）か重さ（キログラム）かが決まらない。必要に応じて書き分ける。",
          "id": "company.0174",
          "type": "pattern",
          "preferred": null,
          "variants": [
            "キロメートル",
            "キログラム",
            "キロ"
          ],
          "pattern": "(?<=(?<![A-Za-z0-9０-９.,])[0-9０-９][0-9０-９.,]*\\s?)キロ(?![ァ-ヶー])",
          "category": "hiragana",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "形式名詞の「わけ」は平仮名で書く（翻訳・言い訳などの語は対象外）。",
          "id": "company.0175",
          "type": "pattern",
          "preferred": "わけ",
          "variants": [
            "わけ",
            "訳"
          ],
          "pattern": "(?<=[るたいなう])(?<!言い)訳(?=[ですがはにも、。だ]|では|じゃ)",
          "replacement": "わけ",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「筈」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0176",
          "type": "preferred",
          "preferred": "はず",
          "variants": [
            "はず",
            "筈"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「儘」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0177",
          "type": "preferred",
          "preferred": "まま",
          "variants": [
            "まま",
            "儘"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「迄」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0178",
          "type": "preferred",
          "preferred": "まで",
          "variants": [
            "まで",
            "迄"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "助詞の「ほど」は平仮名で書く（程度・日程などの語は対象外）。",
          "id": "company.0179",
          "type": "pattern",
          "preferred": "ほど",
          "variants": [
            "ほど",
            "程"
          ],
          "pattern": "(?<=[るたいのなれくうすつむぶぐだ])程(?=[、。でだにのはも]|です|$)",
          "replacement": "ほど",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～のように」「～のような」の「よう」は平仮名で書く（皆様・様子などは対象外）。",
          "id": "company.0180",
          "type": "pattern",
          "preferred": "よう",
          "variants": [
            "よう",
            "様"
          ],
          "pattern": "(?<=[のるたいなじ])様(?=[にな]|で[すあ]|だ)",
          "replacement": "よう",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～という＋名詞」のように内容を説明する「という」は平仮名で書く。実際に口に出して言う意味なら漢字のままでよい。",
          "id": "company.0181",
          "type": "pattern",
          "preferred": "という",
          "variants": [
            "という",
            "と言う"
          ],
          "pattern": "と言う(?=[\\p{sc=Han}\\p{sc=Katakana}]|こと|もの|の[はがをもにでだ]|わけ|ふう|よう|ところ)",
          "replacement": "という",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「貰」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0182",
          "type": "preferred",
          "preferred": "もらう",
          "variants": [
            "もらう",
            "貰う"
          ],
          "inflect": "godan-u",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "補助的に使う「ほしい」は平仮名で書く。物が欲しい意味なら漢字のままでよい。",
          "id": "company.0183",
          "type": "pattern",
          "preferred": "～てほしい",
          "variants": [
            "～てほしい",
            "～て欲しい"
          ],
          "pattern": "(て|[んい]で)欲し(?=[いくかけ])",
          "replacement": "$1ほし",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～にすぎない」は平仮名で書く。",
          "id": "company.0184",
          "type": "pattern",
          "preferred": "～にすぎない",
          "variants": [
            "～にすぎない",
            "～に過ぎない"
          ],
          "pattern": "に過ぎ(?=な|ませ|ず)",
          "replacement": "にすぎ",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「於」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0185",
          "type": "pattern",
          "preferred": "～において",
          "variants": [
            "～において",
            "～に於いて",
            "～における",
            "～に於ける"
          ],
          "pattern": "に於(いて|ける)",
          "replacement": "にお$1",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「～とともに」は平仮名で書く。",
          "id": "company.0186",
          "type": "preferred",
          "preferred": "とともに",
          "variants": [
            "とともに",
            "と共に"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「勿」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0187",
          "type": "preferred",
          "preferred": "もちろん",
          "variants": [
            "もちろん",
            "勿論"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0188",
          "type": "preferred",
          "preferred": "たくさん",
          "variants": [
            "たくさん",
            "沢山"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0189",
          "type": "preferred",
          "preferred": "ちょうど",
          "variants": [
            "ちょうど",
            "丁度"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0190",
          "type": "preferred",
          "preferred": "やはり",
          "variants": [
            "やはり",
            "矢張り"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「或」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0191",
          "type": "preferred",
          "preferred": "あるいは",
          "variants": [
            "あるいは",
            "或いは",
            "或は"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0192",
          "type": "preferred",
          "preferred": "すなわち",
          "variants": [
            "すなわち",
            "即ち"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0193",
          "type": "preferred",
          "preferred": "ただし",
          "variants": [
            "ただし",
            "但し"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0194",
          "type": "pattern",
          "preferred": "なお",
          "variants": [
            "なお",
            "尚"
          ],
          "pattern": "(?<!\\p{sc=Han})尚(?=[、,，\\s])",
          "replacement": "なお",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0195",
          "type": "pattern",
          "preferred": "ついに",
          "variants": [
            "ついに",
            "遂に"
          ],
          "pattern": "(?<!\\p{sc=Han})遂に",
          "replacement": "ついに",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0196",
          "type": "preferred",
          "preferred": "いかに",
          "variants": [
            "いかに",
            "如何に"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0197",
          "type": "preferred",
          "preferred": "いろいろ",
          "variants": [
            "いろいろ",
            "色々",
            "色色"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0198",
          "type": "preferred",
          "preferred": "とりあえず",
          "variants": [
            "とりあえず",
            "取り敢えず",
            "取りあえず"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0199",
          "type": "preferred",
          "preferred": "あえて",
          "variants": [
            "あえて",
            "敢えて"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0200",
          "type": "preferred",
          "preferred": "おおむね",
          "variants": [
            "おおむね",
            "概ね"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0201",
          "type": "preferred",
          "preferred": "あくまで",
          "variants": [
            "あくまで",
            "飽くまで",
            "飽く迄"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0202",
          "type": "preferred",
          "preferred": "いずれ",
          "variants": [
            "いずれ",
            "何れ"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0203",
          "type": "preferred",
          "preferred": "どこ",
          "variants": [
            "どこ",
            "何処"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0204",
          "type": "preferred",
          "preferred": "それぞれ",
          "variants": [
            "それぞれ",
            "夫々",
            "其々"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0205",
          "type": "preferred",
          "preferred": "ふさわしい",
          "variants": [
            "ふさわしい",
            "相応しい"
          ],
          "inflect": "i-adj",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「嬉」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0206",
          "type": "preferred",
          "preferred": "うれしい",
          "variants": [
            "うれしい",
            "嬉しい"
          ],
          "inflect": "i-adj",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0207",
          "type": "preferred",
          "preferred": "ありがとう",
          "variants": [
            "ありがとう",
            "有難う",
            "有り難う"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0208",
          "type": "pattern",
          "preferred": "ございます",
          "variants": [
            "ございます",
            "御座います"
          ],
          "pattern": "御座い(?=ま)",
          "replacement": "ござい",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「謂」は常用漢字表にない漢字（表外字）のため、平仮名で書く。",
          "id": "company.0209",
          "type": "preferred",
          "preferred": "いわゆる",
          "variants": [
            "いわゆる",
            "所謂"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0210",
          "type": "preferred",
          "preferred": "しばらく",
          "variants": [
            "しばらく",
            "暫く"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0211",
          "type": "preferred",
          "preferred": "ようやく",
          "variants": [
            "ようやく",
            "漸く"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "公用文・新聞表記ともに平仮名で書くのが一般的。",
          "id": "company.0212",
          "type": "preferred",
          "preferred": "ますます",
          "variants": [
            "ますます",
            "益々",
            "益益"
          ],
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "「分かりやすい」などの接尾語「やすい」は平仮名で書く。",
          "id": "company.0213",
          "type": "pattern",
          "preferred": "～やすい",
          "variants": [
            "～やすい",
            "～易い"
          ],
          "pattern": "(?<=\\p{sc=Hiragana})易([いくさ]|かっ|けれ)",
          "replacement": "やす$1",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        },
        {
          "reason": "複数を表す接尾語の「たち」は平仮名で書く（「友達」は対象外）。",
          "id": "company.0214",
          "type": "pattern",
          "preferred": "～たち",
          "variants": [
            "～たち",
            "～達"
          ],
          "pattern": "(?<=私|僕|君|彼|彼女|児童|生徒|先生|教師|友人|仲間|自分|人|者|親|大人)達(?![成筆観])",
          "replacement": "たち",
          "category": "hiragana",
          "severity": "warning",
          "fixMode": "confirm",
          "source": {
            "pack": "company",
            "title": "表記統一さん 既定辞書（新聞表記）",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "旧 string[][] 辞書から構造化。既存ルールは安全のため confirm を既定とした。2026-10-13 に検出条件を見直し、常用漢字表（平成22年内閣告示）にない漢字・読みを平仮名で書く語を追加した。"
          }
        }
      ]
    },
    {
      "id": "jtf-3.0",
      "label": "JTF 3.0",
      "description": "JTF日本語標準スタイルガイドから。カタカナ語末の長音など",
      "path": "packs/jtf-3.0/rules.json",
      "priority": 200,
      "defaultEnabled": false,
      "rules": [
        {
          "reason": "JTF 3.0はカタカナ語末の長音を省略しない方針を示す。",
          "id": "jtf-3.0.katakana-long-vowel.server",
          "type": "preferred",
          "preferred": "サーバー",
          "variants": [
            "サーバー",
            "サーバ"
          ],
          "category": "katakana",
          "severity": "warning",
          "fixMode": "auto",
          "source": {
            "pack": "jtf-3.0",
            "title": "JTF日本語標準スタイルガイド 第3.0版",
            "url": "https://www.jtf.jp/pdf/jtf_style_guide.pdf",
            "license": "CC BY 4.0",
            "attribution": "日本翻訳連盟（JTF）",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "原文の方針から機械判定可能な語例へ加工。"
          }
        },
        {
          "reason": "形式名詞としての「ため」は平仮名で書く。語の一部を誤置換しないよう「の」を含む形に限定。",
          "id": "jtf-3.0.hiragana.tame",
          "type": "preferred",
          "preferred": "のため",
          "variants": [
            "のため",
            "の為"
          ],
          "category": "hiragana-kanji",
          "severity": "warning",
          "fixMode": "auto",
          "source": {
            "pack": "jtf-3.0",
            "title": "JTF日本語標準スタイルガイド 第3.0版",
            "url": "https://www.jtf.jp/pdf/jtf_style_guide.pdf",
            "license": "CC BY 4.0",
            "attribution": "日本翻訳連盟（JTF）",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "2.2.1の方針を安全な文字列ルールへ加工。"
          }
        },
        {
          "reason": "「とき」と「時」は品詞・意味で使い分けるため、文脈なしでは統一できない。",
          "id": "jtf-3.0.context.toki",
          "type": "contextual",
          "preferred": null,
          "variants": [
            "とき",
            "時"
          ],
          "category": "context-dependent",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "jtf-3.0",
            "title": "JTF日本語標準スタイルガイド 第3.0版",
            "url": "https://www.jtf.jp/pdf/jtf_style_guide.pdf",
            "license": "CC BY 4.0",
            "attribution": "日本翻訳連盟（JTF）",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "2.2.1の文脈依存ルールを要約。"
          }
        }
      ]
    },
    {
      "id": "bunka-official",
      "label": "文化庁・公用文",
      "description": "「公用文作成の考え方」から。読点・「か所」など",
      "path": "packs/bunka/rules.json",
      "priority": 200,
      "defaultEnabled": false,
      "rules": [
        {
          "reason": "読点は「、」が原則だが横書きでは「，」も許容され、文書内で統一する。",
          "id": "bunka-official.punctuation.comma",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "、",
            "，"
          ],
          "category": "punctuation",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "bunka-official",
            "title": "公用文作成の考え方（文化審議会建議）",
            "url": "https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/93651301_01.pdf",
            "license": "文化庁ウェブサイトの利用条件を要個別確認",
            "attribution": "文化審議会（文化庁）",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "Ⅰ 表記の原則 5(1)アを要約。ライセンス確定まで原文転載はせず、出典付きの事実記述のみ。"
          }
        },
        {
          "reason": "算用数字を使う横書きでは「○か所」とする。数字を含む文脈依存パターンのため自動置換しない。",
          "id": "bunka-official.numeral.kasho",
          "type": "pattern",
          "preferred": "○か所",
          "variants": [
            "○カ所",
            "○ケ所",
            "○ヶ所",
            "○箇所",
            "○ヵ所"
          ],
          "category": "numerals",
          "severity": "warning",
          "fixMode": "none",
          "pattern": "[0-9０-９](?:カ|ケ|ヶ|箇|ヵ)所",
          "source": {
            "pack": "bunka-official",
            "title": "公用文作成の考え方（文化審議会建議）",
            "url": "https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/93651301_01.pdf",
            "license": "文化庁ウェブサイトの利用条件を要個別確認",
            "attribution": "文化審議会（文化庁）",
            "retrievedAt": "2026-07-14",
            "modified": true,
            "notes": "Ⅰ 表記の原則 4ケを機械検出用正規表現へ加工。"
          }
        }
      ]
    },
    {
      "id": "consistency-only",
      "label": "文書内統一のみ",
      "description": "正誤は決めず、文書内での混在だけを知らせる",
      "path": "packs/consistency-only/rules.json",
      "priority": 100,
      "defaultEnabled": false,
      "rules": [
        {
          "reason": "正誤は決めず、同一文書内での混在だけを通知する。",
          "id": "consistency-only.web",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "Web",
            "ウェブ",
            "ウエブ"
          ],
          "category": "general",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "consistency-only",
            "title": "hyoki-checker consistency rules",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true
          }
        },
        {
          "reason": "意味が同じ範囲の表記混在だけを通知し、統一先は決めない。",
          "id": "consistency-only.child",
          "type": "consistency",
          "preferred": null,
          "variants": [
            "子ども",
            "こども",
            "子供"
          ],
          "category": "general",
          "severity": "info",
          "fixMode": "none",
          "source": {
            "pack": "consistency-only",
            "title": "hyoki-checker consistency rules",
            "url": "https://github.com/edi-tool/hyoki-checker",
            "license": "MIT",
            "attribution": "hyoki-checker contributors",
            "retrievedAt": "2026-07-14",
            "modified": true
          }
        }
      ]
    },
    {
      "id": "sudachi",
      "label": "Sudachi候補",
      "path": "packs/sudachi/rules.json",
      "priority": 50,
      "defaultEnabled": false,
      "hidden": true,
      "rules": []
    }
  ]
};
const DEFAULT_RULE_PACKS = GENERATED_RULES.packs;
const DEFAULT_DICT = DEFAULT_RULE_PACKS.flatMap(pack => pack.rules);
