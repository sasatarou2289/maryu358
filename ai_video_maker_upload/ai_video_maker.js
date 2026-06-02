(function () {
  const canvas = document.getElementById("videoCanvas");
  const ctx = canvas.getContext("2d");
  const form = document.getElementById("videoForm");
  const themeInput = document.getElementById("themeInput");
  const serviceInput = document.getElementById("serviceInput");
  const durationInput = document.getElementById("durationInput");
  const orientationInput = document.getElementById("orientationInput");
  const painInput = document.getElementById("painInput");
  const ctaInput = document.getElementById("ctaInput");
  const styleInput = document.getElementById("styleInput");
  const previewButton = document.getElementById("previewButton");
  const recordButton = document.getElementById("recordButton");
  const copyPromptButton = document.getElementById("copyPromptButton");
  const storyboardList = document.getElementById("storyboardList");
  const promptOutput = document.getElementById("promptOutput");
  const statusText = document.getElementById("statusText");
  const downloadLink = document.getElementById("downloadLink");

  let scenes = [];
  let animationFrame = 0;
  let animationStart = 0;
  let isPlaying = false;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    generate();
  });

  previewButton.addEventListener("click", function () {
    if (!scenes.length) generate();
    play(false);
  });

  recordButton.addEventListener("click", function () {
    if (!scenes.length) generate();
    recordVideo();
  });

  copyPromptButton.addEventListener("click", function () {
    if (!promptOutput.value.trim()) generate();
    copyText(promptOutput.value);
  });

  function generate() {
    const input = getInput();
    scenes = buildScenes(input);
    renderStoryboard(scenes);
    promptOutput.value = buildPrompt(input, scenes);
    drawFrame(0);
    statusText.textContent = "構成を生成しました。プレビュー再生、または動画を書き出せます。";
    showToast("AIアニメ動画の構成を生成しました。");
  }

  function getInput() {
    return {
      theme: themeInput.value.trim() || "短いAIアニメ",
      service: serviceInput.value.trim() || "日常系アニメ",
      duration: Number(durationInput.value),
      orientation: orientationInput.value,
      pain: painInput.value.trim() || "主人公の前で不思議な出来事が起きる",
      cta: ctaInput.value.trim() || "最後に小さなどんでん返しが起きる",
      style: styleInput.value.trim() || "2Dアニメ、見やすい構図"
    };
  }

  function buildScenes(input) {
    const horror = isHorror(input);
    const base = [
      {
        role: "フック",
        text: inferHook(input),
        narration: horror ? "放課後の校舎で、ありえない声が聞こえた。" : input.theme + "の物語が始まります。",
        visual: horror ? "放課後の薄暗い学校の廊下。主人公がトイレの前で立ち止まる。" : "物語の舞台で、主人公が何かに気づいて立ち止まる。",
        motion: horror ? "蛍光灯が少しちらつき、主人公がゆっくり振り向く。" : "自然なまばたき、背景がゆっくり揺れる。"
      },
      {
        role: "きっかけ",
        text: shortText(input.pain),
        narration: input.pain + "。",
        visual: horror ? "トイレの扉が少しだけ開き、奥から淡い光が漏れる。" : "主人公の前で、物語のきっかけになる出来事が起きる。",
        motion: horror ? "扉がきしむように少し開き、影がゆっくり伸びる。" : "小物や髪が少し揺れ、カメラが寄る。"
      },
      {
        role: "展開",
        text: horror ? "名前を呼ぶと、何かが返事をする" : input.service + "らしい展開へ",
        narration: horror ? "名前を呼んだ瞬間、鏡の向こうで誰かが笑った。" : input.service + "の雰囲気に合わせて、場面が大きく動きます。",
        visual: horror ? "鏡に主人公とは違う女の子の影が映る。" : "主人公が物語の中心へ進み、印象的な場面が現れる。",
        motion: horror ? "鏡の影だけがゆっくり動き、主人公は固まる。" : "ゆっくりしたカメラ移動、自然な表情変化。"
      },
      {
        role: "ラスト",
        text: shortText(input.cta),
        narration: input.cta,
        visual: horror ? "鏡の中だけに花子さんが立ち、画面が静かに暗くなる。" : "ラストの印象的な表情や決めカットで締める。",
        motion: horror ? "鏡の中の人物だけが近づき、暗転する。" : "自然なまばたき、穏やかなフェード。"
      }
    ];

    const extended = [
        base[0],
        base[1],
        {
          role: "不穏",
          text: horror ? "校舎に足音が響く" : "空気が変わる",
          narration: horror ? "誰もいないはずの廊下に、足音だけが近づいてくる。" : "周りの空気が少し変わり、主人公は次の行動を選びます。",
          visual: horror ? "長い廊下の奥、赤いスカートの影が一瞬見える。" : "背景の色や光が変わり、物語の緊張感が上がる。",
          motion: horror ? "遠くの影が一瞬だけ横切る。" : "背景がゆっくり暗くなり、カメラが寄る。"
        },
        base[2],
        {
          role: "直前",
          text: horror ? "扉の向こうから、声がする" : "クライマックス直前",
          narration: horror ? "扉の向こうから、小さな声で名前を呼ばれる。" : "ラストに向けて、主人公の感情が高まります。",
          visual: horror ? "トイレの個室の扉に、ゆっくり手が伸びる。" : "主人公が決意した表情で前を見る。",
          motion: horror ? "手が扉に近づき、照明が一度だけまたたく。" : "表情が変わり、カメラがゆっくり近づく。"
        },
        base[3]
      ];

    if (input.duration <= 15) return base;
    if (input.duration <= 30) return extended;

    const longScenes = [
      extended[0],
      extended[1],
      {
        role: "人物",
        text: horror ? "主人公は、噂を思い出す" : "主人公の目的が見えてくる",
        narration: horror ? "そのトイレには、昔から奇妙な噂があった。" : "主人公がなぜそこへ向かうのか、少しずつ見えてきます。",
        visual: horror ? "古い学校新聞、赤い文字の怪談メモ、夕暮れの教室。" : "主人公の持ち物や表情から、物語の背景が伝わる。",
        motion: horror ? "紙が小さく揺れ、画面の端に影が落ちる。" : "小物を映しながら、ゆっくりカメラが動く。"
      },
      extended[2],
      {
        role: "探索",
        text: horror ? "三番目の個室だけ、鍵が開いている" : "主人公が一歩踏み出す",
        narration: horror ? "三番目の個室だけ、なぜか鍵が開いていた。" : "主人公は迷いながらも、物語の中心へ進みます。",
        visual: horror ? "古いトイレの三番目の扉。隙間から暗い空間が見える。" : "印象的な場所へ向かって歩く主人公。",
        motion: horror ? "扉の隙間が少し広がる。" : "ゆっくり歩く、背景が横に流れる。"
      },
      extended[3],
      extended[4],
      {
        role: "転換",
        text: horror ? "鏡に映る景色が、現実と違う" : "予想外の変化が起きる",
        narration: horror ? "鏡に映っていたのは、今いるはずのない放課後の教室だった。" : "そこで、予想していなかった変化が起きます。",
        visual: horror ? "鏡の中だけ、教室と赤い影が映っている。" : "背景が変化し、主人公が驚く。",
        motion: horror ? "鏡の中の影だけがゆっくり近づく。" : "カメラが少し引いて、場面が切り替わる。"
      },
      extended[5]
    ];

    if (input.duration <= 60) return longScenes;

    const chapterCount = Math.min(120, Math.ceil(input.duration / 15));
    const chapters = [];
    for (let index = 0; index < chapterCount; index += 1) {
      const source = longScenes[index % longScenes.length];
      chapters.push({
        role: source.role,
        text: source.text,
        narration: source.narration,
        visual: source.visual,
        motion: source.motion
      });
    }

    chapters[0] = longScenes[0];
    chapters[chapters.length - 1] = longScenes[longScenes.length - 1];
    return chapters;
  }

  function inferHook(input) {
    if (isHorror(input)) return "放課後のトイレで、声がした";
    if (input.service.includes("恋愛")) return "たった15秒の、すれ違い";
    if (input.service.includes("冒険") || input.service.includes("ファンタジー")) return "扉の向こうは、知らない世界";
    if (input.service.includes("コメディ")) return "まさかの展開が始まる";
    return shortText(input.theme);
  }

  function isHorror(input) {
    const text = [input.theme, input.service, input.style].join(" ");
    return text.includes("ホラー") || text.includes("怪談") || text.includes("花子") || text.includes("怖");
  }

  function shortText(text) {
    const value = String(text || "").replace(/\s+/g, "");
    return value.length > 20 ? value.slice(0, 20) + "..." : value;
  }

  function play(loop) {
    cancelAnimationFrame(animationFrame);
    isPlaying = true;
    animationStart = performance.now();
    const total = getInput().duration;

    function tick(now) {
      const elapsed = (now - animationStart) / 1000;
      if (elapsed >= total) {
        drawFrame(total);
        if (loop) {
          animationStart = performance.now();
          animationFrame = requestAnimationFrame(tick);
          return;
        }
        isPlaying = false;
        statusText.textContent = "プレビュー再生が完了しました。";
        return;
      }
      drawFrame(elapsed);
      animationFrame = requestAnimationFrame(tick);
    }

    statusText.textContent = "プレビュー再生中です。";
    animationFrame = requestAnimationFrame(tick);
  }

  function drawFrame(elapsed) {
    const input = getInput();
    applyCanvasSize(input);
    const sceneDuration = input.duration / scenes.length;
    const sceneIndex = Math.min(scenes.length - 1, Math.floor(elapsed / sceneDuration));
    const scene = scenes[sceneIndex] || buildScenes(input)[0];
    const local = (elapsed - sceneIndex * sceneDuration) / sceneDuration;
    const pulse = Math.sin(elapsed * Math.PI * 2 * 0.25);
    const blink = Math.sin(elapsed * Math.PI * 2 * 0.7) > 0.94;

    drawBackground(sceneIndex, local, pulse);
    drawSetting(sceneIndex, local, input);
    drawCharacter(sceneIndex, local, pulse, blink);
    drawAtmosphere(elapsed, sceneIndex, input);
    drawCaption(scene.text, scene.role, local);
    drawProgress(elapsed, input.duration);
  }

  function applyCanvasSize(input) {
    const width = input.orientation === "landscape" ? 1280 : 720;
    const height = input.orientation === "landscape" ? 720 : 1280;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    canvas.dataset.orientation = input.orientation;
  }

  function drawBackground(sceneIndex, local, pulse) {
    const input = getInput();
    const layout = getLayout(input);
    const gradient = ctx.createLinearGradient(0, 0, layout.width, layout.height);
    if (isHorror(input)) {
      gradient.addColorStop(0, "#17202a");
      gradient.addColorStop(0.52, "#314451");
      gradient.addColorStop(1, "#0f151d");
    } else {
      gradient.addColorStop(0, sceneIndex % 2 === 0 ? "#fff7e8" : "#eef7f1");
      gradient.addColorStop(0.52, "#f8e4dd");
      gradient.addColorStop(1, sceneIndex % 2 === 0 ? "#dcebf0" : "#f9f1df");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, layout.width, layout.height);

    ctx.globalAlpha = 0.22 + local * 0.08;
    ctx.fillStyle = "#ffffff";
    circle(layout.width * 0.16 + pulse * 10, layout.height * 0.14, layout.width * 0.2);
    circle(layout.width * 0.86 - pulse * 12, layout.height * 0.78, layout.width * 0.25);
    ctx.globalAlpha = 1;
  }

  function drawSetting(sceneIndex, local, input) {
    const horror = isHorror(input);
    const layout = getLayout(input);
    const room = layout.room;
    ctx.fillStyle = horror ? "rgba(233, 241, 239, 0.18)" : "rgba(255, 255, 255, 0.58)";
    roundRect(room.x, room.y, room.w, room.h, 24);
    ctx.fill();

    ctx.fillStyle = horror ? "#56616a" : "#d4b98a";
    roundRect(room.x + room.w * 0.08, room.y + room.h * 0.75, room.w * 0.84, 34, 16);
    ctx.fill();

    ctx.fillStyle = horror ? "#2f3940" : "#b8866e";
    roundRect(room.x + room.w * 0.1, room.y + room.h * 0.78, 32, 96, 10);
    roundRect(room.x + room.w * 0.86, room.y + room.h * 0.78, 32, 96, 10);
    ctx.fill();

    ctx.fillStyle = horror ? "#dfe8e6" : "#ffffff";
    roundRect(room.x + room.w * 0.1, room.y + room.h * 0.42, 120, 140, 16);
    ctx.fill();
    ctx.fillStyle = horror ? "#24302f" : "#8aa596";
    roundRect(room.x + room.w * 0.14, room.y + room.h * 0.5, 76, 18, 7);
    ctx.fill();

    ctx.strokeStyle = horror ? "rgba(255, 255, 255, 0.18)" : "rgba(66, 99, 84, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(room.x + 24, room.y + room.h * 0.2);
    ctx.quadraticCurveTo(room.x + room.w * 0.5, room.y + room.h * 0.12 + local * 16, room.x + room.w - 24, room.y + room.h * 0.2);
    ctx.stroke();
  }

  function drawCharacter(sceneIndex, local, pulse, blink) {
    const input = getInput();
    const layout = getLayout(input);
    const x = layout.character.x;
    const y = layout.character.y + pulse * 4;
    const scale = layout.character.scale;
    const soften = sceneIndex >= scenes.length - 1 ? 1 : local;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-360, -610);

    ctx.fillStyle = "#f0c6ad";
    roundRect(360 - 92, 610 + 115, 184, 210, 70);
    ctx.fill();

    ctx.fillStyle = sceneIndex % 2 === 0 ? "#8aa596" : "#d87563";
    roundRect(360 - 138, 610 + 238, 276, 230, 70);
    ctx.fill();

    ctx.fillStyle = "#594238";
    circle(360, 610 - 64, 122);
    ctx.fillStyle = "#f4c9b4";
    circle(360, 610 - 28, 104);

    ctx.fillStyle = "#594238";
    roundRect(360 - 112, 610 - 130, 224, 86, 42);
    ctx.fill();
    roundRect(360 - 124, 610 - 70, 44, 152, 22);
    roundRect(360 + 80, 610 - 70, 44, 152, 22);
    ctx.fill();

    ctx.strokeStyle = "#3f3330";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(360 - 44, 610 - 18);
    ctx.quadraticCurveTo(360 - 30, 610 - (blink ? 18 : 24), 360 - 15, 610 - 18);
    ctx.moveTo(360 + 15, 610 - 18);
    ctx.quadraticCurveTo(360 + 30, 610 - (blink ? 18 : 24), 360 + 44, 610 - 18);
    ctx.stroke();

    ctx.strokeStyle = "#b87872";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(360 - 28, 610 + 44);
    ctx.quadraticCurveTo(360, 610 + 58 + soften * 10, 360 + 28, 610 + 44);
    ctx.stroke();

    ctx.fillStyle = "rgba(216, 117, 99, 0.26)";
    circle(360 - 58, 610 + 18, 22);
    circle(360 + 58, 610 + 18, 22);

    ctx.strokeStyle = "rgba(66, 99, 84, 0.42)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(360 - 135, 610 + 330);
    ctx.quadraticCurveTo(360 - 98, 610 + 368 + pulse * 5, 360 - 54, 610 + 338);
    ctx.moveTo(360 + 135, 610 + 330);
    ctx.quadraticCurveTo(360 + 98, 610 + 368 + pulse * 5, 360 + 54, 610 + 338);
    ctx.stroke();
    ctx.restore();
  }

  function drawAtmosphere(elapsed, sceneIndex, input) {
    const layout = getLayout(input);
    ctx.strokeStyle = isHorror(input) ? "rgba(210, 230, 235, 0.34)" : "rgba(255, 255, 255, 0.78)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (let i = 0; i < 7; i += 1) {
      const offset = ((elapsed * 38 + i * 72) % (layout.height * 0.4));
      const x = layout.width * 0.2 + i * layout.width * 0.1 + Math.sin(elapsed + i) * 16;
      const y = layout.height * 0.72 - offset;
      ctx.globalAlpha = Math.max(0, 1 - Math.abs(y - 580) / 360) * (sceneIndex >= 1 ? 1 : 0.58);
      ctx.beginPath();
      ctx.moveTo(x, y + 70);
      ctx.bezierCurveTo(x - 24, y + 34, x + 24, y - 12, x, y - 58);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawCaption(text, role, local) {
    const layout = getLayout(getInput());
    const cap = layout.caption;
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    roundRect(cap.x, cap.y, cap.w, cap.h, 18);
    ctx.fill();

    ctx.fillStyle = "#426354";
    ctx.font = "700 " + cap.roleSize + "px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    ctx.fillText(role, cap.x + 34, cap.y + 48);

    ctx.fillStyle = "#24302f";
    ctx.font = "800 " + cap.textSize + "px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    wrapText(text, cap.x + 34, cap.y + 108, cap.w - 80, cap.lineHeight);

    ctx.globalAlpha = Math.min(1, local * 2);
    ctx.fillStyle = "#d87563";
    roundRect(cap.x + 34, cap.y + cap.h - 74, 238, 52, 26);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    ctx.fillText("AI ANIME", cap.x + 62, cap.y + cap.h - 40);
    ctx.globalAlpha = 1;
  }

  function drawProgress(elapsed, duration) {
    const layout = getLayout(getInput());
    const x = layout.width * 0.08;
    const y = layout.height - 34;
    const w = layout.width * 0.84;
    ctx.fillStyle = "rgba(66, 99, 84, 0.22)";
    roundRect(x, y, w, 10, 5);
    ctx.fill();
    ctx.fillStyle = "#426354";
    roundRect(x, y, w * Math.min(1, elapsed / duration), 10, 5);
    ctx.fill();
  }

  function getLayout(input) {
    if (input.orientation === "landscape") {
      return {
        width: 1280,
        height: 720,
        room: { x: 70, y: 80, w: 720, h: 520 },
        character: { x: 915, y: 300, scale: 0.58 },
        caption: { x: 70, y: 456, w: 700, h: 190, roleSize: 24, textSize: 38, lineHeight: 48 }
      };
    }
    return {
      width: 720,
      height: 1280,
      room: { x: 70, y: 210, w: 580, h: 760 },
      character: { x: 360, y: 610, scale: 1 },
      caption: { x: 70, y: 910, w: 580, h: 190, roleSize: 26, textSize: 44, lineHeight: 56 }
    };
  }

  function renderStoryboard(items) {
    storyboardList.innerHTML = "";
    items.forEach(function (scene, index) {
      const card = document.createElement("article");
      card.className = "story-card";
      card.innerHTML = [
        "<div class=\"story-meta\"><span>Scene " + (index + 1) + "</span><span>" + escapeHtml(scene.role) + "</span></div>",
        "<h3>" + escapeHtml(scene.text) + "</h3>",
        "<p>" + escapeHtml(scene.narration) + "</p>",
        "<p>" + escapeHtml(scene.visual) + "</p>"
      ].join("");
      storyboardList.appendChild(card);
    });
  }

  function buildPrompt(input, items) {
    const header = [
      "AIアニメ動画生成プロンプト",
      "",
      "テーマ: " + input.theme,
      "ジャンル・題材: " + input.service,
      "あらすじ・起きること: " + input.pain,
      "動画尺: " + input.duration + "秒",
      "画面比率: " + (input.orientation === "landscape" ? "horizontal 16:9" : "vertical 9:16"),
      "ラスト・オチ: " + input.cta,
      "雰囲気: " + input.style,
      "",
      "共通指定: " + (input.orientation === "landscape" ? "horizontal 16:9" : "vertical 9:16") + ", 2D Japanese anime style, cinematic composition, consistent character design, clear facial expression, readable scene, no text in image, no logo, no distorted hands, smooth motion",
      ""
    ];

    const body = items.map(function (scene, index) {
      return [
        "Scene " + (index + 1) + " / " + scene.role,
        "画面: " + scene.visual,
        "動き: " + scene.motion,
        "字幕: " + scene.text,
        "動画指定: slow controlled motion, natural blinking, cinematic camera push-in, atmospheric lighting, smooth transition, stable character design"
      ].join("\n");
    });

    return header.concat(body).join("\n\n");
  }

  function recordVideo() {
    if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
      showToast("このブラウザでは動画書き出しに対応していません。");
      return;
    }

    const input = getInput();
    const stream = canvas.captureStream(30);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: getMimeType() });

    recorder.ondataavailable = function (event) {
      if (event.data && event.data.size) chunks.push(event.data);
    };

    recorder.onstop = function () {
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "ai_anime_video.webm";
      downloadLink.hidden = false;
      statusText.textContent = "動画を書き出しました。WebMを保存できます。";
      showToast("動画を書き出しました。");
    };

    statusText.textContent = "動画を書き出し中です。完了まで少し待ってください。";
    if (input.duration >= 600) {
      statusText.textContent = "長尺動画を書き出し中です。10分以上はブラウザが重くなる場合があります。";
    }
    recorder.start();
    play(false);
    window.setTimeout(function () {
      recorder.stop();
    }, input.duration * 1000 + 280);
  }

  function getMimeType() {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return candidates.find(function (type) {
      return MediaRecorder.isTypeSupported(type);
    }) || "";
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("プロンプトをコピーしました。");
      }).catch(function () {
        fallbackCopy(text);
      });
      return;
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand("copy");
      showToast("コピーしました。");
    } catch (error) {
      showToast("コピーできませんでした。");
    }
    field.remove();
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function circle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function wrapText(text, x, y, maxWidth, lineHeight) {
    const chars = String(text).split("");
    let line = "";
    let currentY = y;
    chars.forEach(function (char) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    if (line) ctx.fillText(line, x, currentY);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2400);
  }

  generate();
})();
