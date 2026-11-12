/* CANDY COOKIE CHOCOLATE — timed lyric sheet + phrase helpers */
(() => {
  'use strict';

  const COLORS = ['#FFD52E', '#FF3D8B', '#35E3E8'];

  // Timings follow the official manual RU/EN subtitles, cross-checked against
  // the beat grid. `big` is the giant word used by the 'hit' scene.
  const RAW = [
    // ---------------------------------------------------------------- intro hook
    { t: 1.75, end: 3.88, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY CANDY CANDY', ru: 'КОНФЕТКА!' },
    { t: 3.88, end: 4.61, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 4.61, end: 6.06, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY CANDY', ru: 'КОНФЕТКА!' },
    { t: 6.06, end: 7.38, kind: 'hook', hide: true, big: 'CHOCOLATE', sub: 'チョコレート', jp: 'CHOCOLATE', ru: 'ШОКОЛАДКА!' },
    { t: 7.38, end: 9.38, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY CANDY CANDY', ru: 'КОНФЕТКА!' },
    { t: 9.38, end: 10.22, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 10.22, end: 11.63, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY CANDY', ru: 'КОНФЕТКА!' },
    { t: 11.63, end: 13.20, kind: 'hook', hide: true, big: 'CHOCOLATE', sub: 'チョコレート', jp: 'CHOCOLATE', ru: 'ШОКОЛАДКА!' },
    { t: 16.83, end: 19.00, kind: 'hook', hide: true, big: 'CHOCOLATE!', sub: 'チョコレート', jp: 'CHOCOLATE!', ru: 'ШОКОЛАДКА!' },

    // ---------------------------------------------------------------- verse 1
    { t: 23.51, end: 26.51, kind: 'verse', jp: 'いちばん上は困難（コンナン）', ru: 'Быть наверху — это так трудно' },
    { t: 26.51, end: 29.29, kind: 'verse', jp: '一番下は散々（サンザン）', ru: 'А в самом низу — вовсе ужасно' },
    { t: 29.29, end: 31.92, kind: 'verse', jp: '間にはさまれジーザス（ジーザス）', ru: 'Застрять посередине — не дай Бог' },
    { t: 31.92, end: 34.62, kind: 'verse', jp: '誰か食べ始めてね？団子', ru: 'Кто-то уже начал есть? Данго!' },

    // ---------------------------------------------------------------- verse 2
    { t: 34.62, end: 37.52, kind: 'verse', jp: '包装（えがら）だけ気に入って（コンナン）', ru: 'Мне нравится лишь обёртка' },
    { t: 37.52, end: 40.37, kind: 'verse', jp: '開けないまま棚に飾って（サンザン）', ru: 'Даже не открыв, ставлю на полку' },
    { t: 40.37, end: 46.00, kind: 'verse', jp: '中身が何か知らないね！', ru: 'И что там внутри — без понятия!' },

    // ---------------------------------------------------------------- pre-chorus
    { t: 46.00, end: 47.69, kind: 'pre', jp: '興味すらもない', ru: 'Мне совсем не интересно' },
    { t: 47.69, end: 49.06, kind: 'pre', jp: 'あり得ぬリアライズ', ru: 'Всё равно ничего не пойму' },
    { t: 49.06, end: 51.48, kind: 'pre', jp: 'クセにとりま買い buy bye …', ru: 'Но не важно — просто покупай-бай-бай' },
    { t: 51.48, end: 54.20, kind: 'pre', jp: 'バイナリ＞バイタリティ', ru: 'Бинарность > жизненная сила' },
    { t: 54.20, end: 55.20, kind: 'chant', hide: true, big: '限界', jp: '限界', ru: 'На пределе!' },
    { t: 55.20, end: 56.10, kind: 'chant', hide: true, big: '極彩', jp: '極彩（ごくさい）', ru: 'На грани безумия!' },
    { t: 56.10, end: 57.37, kind: 'chant', hide: true, big: '大喝采', jp: '大喝采！', ru: 'Бурные овации!' },

    // ---------------------------------------------------------------- chorus 1
    { t: 57.37, end: 58.69, kind: 'chorus', jp: 'バーゲンばっか踊っていけ', ru: 'Потанцуй на распродаже' },
    { t: 58.69, end: 60.09, kind: 'chorus', jp: 'ほら一分舞った やっぱっぱ…', ru: 'Трам-па-па, и минутка прошла' },
    { t: 60.09, end: 61.45, kind: 'chorus', jp: '表現OK 良いじゃん、ねえ？', ru: 'По лицу вижу, всё окей же?' },
    { t: 61.45, end: 63.00, kind: 'chorus', jp: 'あれ、真っ赤になっちゃった！', ru: 'Ой-ой, да ты весь красный!' },
    { t: 63.00, end: 64.29, kind: 'chorus', jp: '絶対さっき言おうとして', ru: 'Я же хотела что-то сказать' },
    { t: 64.29, end: 65.64, kind: 'chorus', jp: 'あれ何だったっけ？あっちゃちゃ', ru: 'Что же это было-то…' },
    { t: 65.64, end: 66.74, kind: 'chorus', jp: 'そっか！一個思い出した', ru: 'Ах да, точно! Вспомнила!' },
    { t: 66.74, end: 68.11, kind: 'chorus', jp: '君は助けない', ru: 'Помощи от тебя ни-ка-кой' },

    // ---------------------------------------------------------------- hook
    { t: 80.64, end: 81.90, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 81.90, end: 83.34, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 83.34, end: 86.12, kind: 'hook', hide: true, big: 'CHOCOLATE', sub: 'チョコレート', jp: 'CHOCOLATE', ru: 'ШОКОЛАДКА!' },
    { t: 86.12, end: 87.42, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 87.42, end: 88.81, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 88.81, end: 91.14, kind: 'hook', hide: true, big: 'CHOCOLATE', sub: 'チョコレート', jp: 'CHOCOLATE', ru: 'ШОКОЛАДКА!' },
    { t: 91.14, end: 91.73, kind: 'hook', hide: true, big: 'CA-CA-CA', jp: 'CA CA CA', ru: 'КО-КО-КО' },
    { t: 91.73, end: 93.72, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 93.72, end: 94.42, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 94.42, end: 95.87, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 95.87, end: 97.21, kind: 'hook', hide: true, big: 'CHOCOLATE', sub: 'チョコレート', jp: 'CHOCOLATE', ru: 'ШОКОЛАДКА!' },
    { t: 97.21, end: 99.21, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 99.21, end: 100.00, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 100.00, end: 101.45, kind: 'hook', hide: true, big: 'CANDY', sub: 'キャンディー', jp: 'CANDY', ru: 'КОНФЕТКА!' },
    { t: 101.45, end: 102.82, kind: 'hook', hide: true, big: 'CHOCOLA-', sub: 'チョコラ', jp: 'CHOCOLA-', ru: 'ШОКОЛА…' },
    { t: 102.82, end: 103.86, kind: 'hook', hide: true, big: 'CAN-CHO', jp: 'CAN-CHO-CAN-CHO', ru: 'КОН-ШО-КОН-ШО' },
    { t: 103.86, end: 104.41, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 104.41, end: 104.91, kind: 'hook', hide: true, big: 'CAN-COO', jp: 'CAN-COO', ru: 'КОН-ПЕ' },
    { t: 104.91, end: 105.62, kind: 'hook', hide: true, big: 'LATE!', jp: 'LATE!', ru: 'ЛАДКА!' },
    { t: 105.62, end: 106.61, kind: 'hook', hide: true, big: 'CAN-COOKIE', jp: 'CAN-COOKIE', ru: 'КОН-ПЕЧЕНЬКА' },
    { t: 106.61, end: 107.33, kind: 'hook', hide: true, big: 'COO-CANDY', jp: 'COO-CANDY', ru: 'ПЕ-КОНФЕТКА' },
    { t: 107.33, end: 108.30, kind: 'hook', hide: true, big: 'LATE!', jp: 'LATE!', ru: 'ЛАДКА!' },
    { t: 108.30, end: 109.39, kind: 'hook', hide: true, big: 'CAN-CHO', jp: 'CAN-CHO-CAN-CHO', ru: 'КОН-ШО-КОН-ШО' },
    { t: 109.39, end: 109.96, kind: 'hook', hide: true, big: 'COOKIE', sub: 'クッキー', jp: 'COOKIE', ru: 'ПЕЧЕНЬКА!' },
    { t: 109.96, end: 110.46, kind: 'hook', hide: true, big: 'CAN-COO', jp: 'CAN-COO', ru: 'КОН-ПЕ' },
    { t: 110.46, end: 112.44, kind: 'hook', hide: true, big: 'LATE!', jp: 'LATE!', ru: 'ЛАДКА!' },
    { t: 113.23, end: 116.70, kind: 'hook', hide: true, big: 'CHOCOLATE!', sub: 'チョコレート', jp: 'CHOCOLATE!', ru: 'ШОКОЛАДКА!' },

    // ---------------------------------------------------------------- chorus 2
    { t: 125.09, end: 126.21, kind: 'chorus', jp: 'バーゲンばっか踊っていけ', ru: 'Потанцуй на распродаже' },
    { t: 126.21, end: 127.72, kind: 'chorus', jp: 'ほら一分舞った やっぱっぱ…', ru: 'Трам-па-па, и минутка прошла' },
    { t: 127.72, end: 129.01, kind: 'chorus', jp: '表現OK 良いじゃん、ねえ？', ru: 'По лицу вижу, всё окей же?' },
    { t: 129.01, end: 130.43, kind: 'chorus', jp: 'あれ、真っ赤になっちゃった！', ru: 'Ой-ой, да ты весь красный!' },
    { t: 130.43, end: 131.76, kind: 'chorus', jp: '絶対さっき言おうとして', ru: 'Я же хотела что-то сказать' },
    { t: 131.76, end: 133.34, kind: 'chorus', jp: 'あれ何だったっけ？あっちゃちゃ', ru: 'Что же это было-то…' },
    { t: 133.34, end: 134.50, kind: 'chorus', jp: 'そっか！一個思い出した', ru: 'Ах да, точно! Вспомнила!' },
    { t: 134.50, end: 136.13, kind: 'chorus', jp: '君は助けない', ru: 'Помощи от тебя ни-ка-кой' },
    { t: 136.13, end: 137.32, kind: 'chorus', jp: 'バーゲンばっか描いていけ', ru: 'Рисуй сплошные распродажи' },
    { t: 137.32, end: 138.90, kind: 'chorus', jp: 'ほら嬢さんミンナは待ってんだ', ru: 'Ну же, мисс, все заждались' },
    { t: 138.90, end: 140.00, kind: 'chorus', jp: '表現オーライ！無問題！', ru: 'По лицу вижу, всё в порядке?' },
    { t: 140.00, end: 141.65, kind: 'chorus', jp: 'あれMADになっちゃった！', ru: 'Ой-ой, да ты не в своём уме!' },
    { t: 141.65, end: 142.88, kind: 'chorus', jp: 'ジャンキーファッキンえっちいね', ru: 'Это жутко, дико сексуально' },
    { t: 142.88, end: 144.39, kind: 'chorus', jp: 'そのメーカーばっか選んじゃった', ru: 'В голове всё тот же бренд' },
    { t: 144.39, end: 145.62, kind: 'chorus', jp: 'そっか！一個思い出した', ru: 'Ах да, точно! Вспомнила!' },
    { t: 145.62, end: 147.30, kind: 'chorus', jp: '誰も助けない', ru: 'Мне уже никто не поможет' },

    // ---------------------------------------------------------------- last shout
    { t: 151.55, end: 155.00, kind: 'hook', hide: true, big: 'CHOCOLATE!', sub: 'チョコレート', jp: 'CHOCOLATE!', ru: 'ШОКОЛАДКА!' }
  ];

  const entries = RAW
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((e, i) => Object.assign({}, e, { idx: i, color: e.color || COLORS[i % COLORS.length] }));

  function indexAt(t) {
    let lo = 0, hi = entries.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].t <= t) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }

  function at(t) {
    const i = indexAt(t);
    if (i < 0) return null;
    const e = entries[i];
    return t < e.end ? e : null;
  }

  function last(t) {
    const i = indexAt(t);
    return i < 0 ? null : entries[i];
  }

  function next(t) {
    const i = indexAt(t);
    for (let k = Math.max(0, i); k < entries.length; k++) {
      if (entries[k].t >= t) return entries[k];
    }
    return null;
  }

  window.CANDY_LYRICS = {
    entries,
    colors: COLORS,
    indexAt,
    at,
    last,
    next
  };
})();
