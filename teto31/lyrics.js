/* 目撃！テト３１世 — timed lyric data (JP / RU) */
(() => {
  'use strict';

  // Times follow the official RU / EN subtitle phrases, cross-checked against
  // the 160 BPM grid (first beat 0.900 s, beat = 0.375 s).
  const entries = [
    // ── Q&A verse ──────────────────────────────────────────────────────────
    { t: 6.86,  end: 11.36, jp: '君の一番 かわいいところ な～んだ？', ru: 'Что в тебе самого милого, а?', color: '#FF7A18' },
    { t: 11.36, end: 12.65, jp: '（かかと？）', ru: '(Пятки?)', color: '#FFD24A' },
    { t: 12.69, end: 17.43, jp: '撃ち抜かれたら 飛び出ちゃうもの な～んだ？', ru: 'Что наружу вылетит, если тебя прострелят?', color: '#FF2E4D' },
    { t: 17.43, end: 18.65, jp: '（ハート？）', ru: '(Сердце?)', color: '#FFD24A' },
    { t: 18.69, end: 23.77, jp: '大きくなると 固くなるもの な～んだ？', ru: 'Что твердеет, когда вырастает?', color: '#B8FF3D' },
    { t: 23.77, end: 24.68, jp: '（あー…）', ru: '(А-а…)', color: '#FFF4DC' },
    { t: 24.72, end: 30.46, jp: '君が一番 ドキドキするの だ～れ～だ！！！', ru: 'А от кого твоё сердечко стучит сильней?', color: '#B18CFF' },
    { t: 30.50, end: 32.32, jp: 'ボクのことでしょ？', ru: 'Это же я, да?', color: '#FF7A18' },
    { t: 32.36, end: 33.49, jp: '（違うがー？）', ru: '(А вот и нет!)', color: '#FF2E4D' },

    // ── hook / chants: no lower-third, giant words carry the vocal ─────────
    { t: 44.99, end: 45.48, jp: 'わかんない！！', ru: 'НЕ ПОНИМАЮ!!', color: '#FFF4DC', hide: true },

    // ── second hook ────────────────────────────────────────────────────────
    { t: 47.23, end: 48.53, jp: '無責任だけど！', ru: 'Безответственно, но!', color: '#FF7A18' },
    { t: 50.22, end: 51.49, jp: '奪ったげるわ', ru: 'Я тебя украду!', color: '#FF2E4D' },
    { t: 53.24, end: 54.55, jp: '痛くしないから', ru: 'Будет не больно, обещаю.', color: '#FFF4DC' },
    { t: 54.59, end: 59.49, jp: '初めて ボクが 奪ったげるわ', ru: 'Впервые в жизни я украду тебя!', color: '#FFD24A' },

    // ── the calling card ───────────────────────────────────────────────────
    { t: 59.53, end: 61.25, jp: 'よいこの みんなへ', ru: 'Всем примерным детям!', color: '#FFD24A' },
    { t: 61.29, end: 63.16, jp: '今からボクは、お前らの █████を いただきに参上します！', ru: 'Сегодня я явлюсь забрать ваши █████!', color: '#FF7A18' },
    { t: 63.16, end: 65.74, jp: 'いただきに 参上します！', ru: 'С визитом — за вашими сердцами!', color: '#FF2E4D' },
    { t: 65.78, end: 68.60, jp: 'from テト31世', ru: 'от Тето XXXI', color: '#FFF4DC' },

    // ── P.S. ───────────────────────────────────────────────────────────────
    { t: 68.64, end: 69.55, jp: 'p.s.', ru: 'P.S.', color: '#FFD24A' },
    { t: 69.55, end: 71.25, jp: 'ちなみに 僕は～', ru: 'Кстати, я…', color: '#FFD24A' },
    { t: 71.25, end: 72.75, jp: '名画も 秘宝も', ru: 'Ни шедевры, ни сокровища…', color: '#FF7A18' },
    { t: 72.75, end: 75.44, jp: '絶～っ対 奪ったりなんて しないんだからね？', ru: 'Я абсолютно никогда не краду, ясно?', color: '#FF2E4D' },
    { t: 75.48, end: 77.02, jp: '…ほ、本当だよ？', ru: '…Ч-честно-честно!', color: '#FFF4DC' },
    { t: 77.02, end: 79.24, jp: 'あ、あと… 最後に一言…', ru: 'А, и ещё… последнее…', color: '#B18CFF' },
    { t: 79.28, end: 83.10, jp: 'ういちゃんに どうしても 伝えたいことがあるんだ。', ru: 'Мне нужно кое-что сказать Уи-тян.', color: '#FFD24A' },

    // ── proposal gag ───────────────────────────────────────────────────────
    { t: 83.10, end: 84.64, jp: 'おかしなこと 言ってもいい？', ru: 'Можно странный вопрос?', color: '#FF7A18' },
    { t: 84.64, end: 86.00, jp: 'ボクと 結婚してくれ！', ru: 'Выходи за меня!', color: '#FF2E4D' },
    { t: 86.00, end: 86.77, jp: 'おまえと', ru: 'За тебя…', color: '#FFF4DC' },
    { t: 86.77, end: 87.50, jp: '結婚', ru: '…замуж…', color: '#FFF4DC' },
    { t: 87.50, end: 89.02, jp: 'する訳ないんだがー？', ru: 'Я не выйду, вообще-то!', color: '#B8FF3D' },
    { t: 89.06, end: 92.00, jp: '（ぬああああああああああ！）', ru: 'НЕЕЕЕЕЕЕЕЕЕТ!', color: '#FF2E4D', hide: true },

    // ── candy callback ─────────────────────────────────────────────────────
    { t: 101.04, end: 101.78, jp: 'CANDY CANDY', ru: 'КОНФЕТЫ!', color: '#FF5FA2', hide: true },
    { t: 101.82, end: 102.38, jp: 'COOKIE COOKIE', ru: 'ПЕЧЕНЬКИ!', color: '#FFD24A', hide: true },
    { t: 102.56, end: 103.91, jp: 'チョコレート！', ru: 'ШОКОЛАД!', color: '#C98A55', hide: true },

    // ── fourth hook ────────────────────────────────────────────────────────
    { t: 105.73, end: 107.10, jp: '無責任なのは ボクじゃないわ', ru: 'Безответственная — это не я!', color: '#B8FF3D' },
    { t: 108.74, end: 110.07, jp: '勘違いしないで', ru: 'Не перепутай!', color: '#FF7A18' },
    { t: 111.74, end: 113.06, jp: '勘違いしないで', ru: 'Не поймите неправильно!', color: '#FF2E4D' },
    { t: 113.10, end: 114.76, jp: 'キミたち～？', ru: 'Вы все…?', color: '#B18CFF' },
    { t: 114.80, end: 116.00, jp: 'ボクが 奪ったげるわ', ru: 'Я вас украду!', color: '#FFD24A' },

    // ── breakdown / chase ──────────────────────────────────────────────────
    { t: 116.00, end: 119.80, jp: 'GUILTY', ru: 'ВИНОВНА!', color: '#FF2E4D', hide: true },
    { t: 119.80, end: 124.82, jp: 'NOT GUILTY anymore', ru: 'НЕ ВИНОВНА!', color: '#B8FF3D', hide: true },
    { t: 124.86, end: 126.75, jp: '捕まえられるものなら', ru: 'Поймай меня…', color: '#FFD24A' },
    { t: 126.75, end: 128.28, jp: 'られるものなら', ru: '…если сможешь!', color: '#FF7A18' },
    { t: 128.28, end: 129.72, jp: 'られるものなら', ru: '…если сможешь!!', color: '#FF2E4D' },
    { t: 129.72, end: 131.17, jp: 'られるものなら', ru: '…если сможешь!!!', color: '#B18CFF' },
    { t: 131.17, end: 134.50, jp: '捕まえた！', ru: 'Поймали!', color: '#B8FF3D', hide: true }
  ];

  entries.sort((a, b) => a.t - b.t);

  function at(t) {
    let lo = 0, hi = entries.length - 1, ans = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].t <= t) { ans = entries[mid]; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans && t < ans.end ? ans : null;
  }

  function next(t) {
    for (let i = 0; i < entries.length; i++) if (entries[i].t >= t) return entries[i];
    return null;
  }

  function last(t) {
    let ans = null;
    for (const e of entries) { if (e.t <= t) ans = e; else break; }
    return ans;
  }

  function indexAt(t) {
    let lo = 0, hi = entries.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].t <= t) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }

  window.TETO31_LYRICS = { entries, at, next, last, indexAt };
})();
