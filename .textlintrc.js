module.exports = {
  rules: {
    // @see https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing
    "preset-ja-technical-writing": {
      // 文の長さ。
      "sentence-length": {
        max: 600,
      },

      // 連続できる最大の漢字長。
      "max-kanji-continuous-len": {
        max: 15,
      },

      // 敬体と常体の設定。
      "no-mix-dearu-desumasu": {
        // 本文(Body)。
        preferInHeader: "ですます",

        // 見出し(Header)。
        preferInBody: "ですます",

        // 箇条書き(List)。
        preferInList: "ですます",

        // 文末以外でも敬体(ですます調)と常体(である調)を厳しくチェックするかどうか。
        strict: true,
      },

      // 感嘆符と疑問符を許可する。
      "no-exclamation-question-mark": false,

      // 弱い表現を許可する。
      "ja-no-weak-phrase": false,

      // 助詞の連続をの設定。
      "no-doubled-joshi": {
        // 助詞の token 同士の間隔値が 1 以下ならエラーにする。
        // 間隔値は 1 から開始される。
        min_interval: 1,
      },
    },

    // @see https://github.com/textlint-ja/textlint-rule-preset-ja-spacing
    "preset-ja-spacing": {
      // 全角半角間にスペースを空ける。
      "ja-space-between-half-and-full-width": {
        space: "always",
      },
    },

    // @see https://github.com/proofdict/proofdict/tree/master/packages/%40proofdict/textlint-rule-proofdict
    "@proofdict/proofdict": {
      dicts: [
        {
          dictURL: "https://azu.github.io/proof-dictionary/",
          autoUpdateInterval: 1000,
        },
      ],
    },
  },
};
