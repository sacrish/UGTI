window.UGTI_CONFIG = {
  resultOrder: [
    "ddl",
    "mystery",
    "ootder",
    "reliable",
    "mature",
    "melancholy",
    "sunny"
  ],
  results: [
    {
      id: "ddl",
      name: "DDL战神",
      image: "./assets/personality-placeholder.png",
      tags: ["极限抗压", "卡点之王", "拖延满级选手"],
      portrait: "**不到最后一刻绝不动手**，是你刻在骨子里的大学生法则。平时佛系松弛，截止日前直接开挂，专注力、爆发力瞬间拉满。别人熬夜焦虑赶工，你极限卡点高质量完工，主打拖延但绝不翻车，是大学里最传奇的极限操作大师。",
      slogan: "一切都来得及！极限创造奇迹！",
      palette: ["#ff5b4a", "#ffd84f", "#17130f"]
    },
    {
      id: "mystery",
      name: "校园神秘人",
      image: "./assets/personality-placeholder.png",
      tags: ["低调隐身", "行踪成谜", "小众独处", "清冷慢热"],
      portrait: "班级群潜水常客，课堂低调坐角落，平时行踪飘忽不定。不爱凑热闹、不主动社交，存在感不高但极具个人节奏。看似冷冷清清，实则内心通透清醒，默默过完四年大学生活，安静蓄力，悄悄优秀。",
      slogan: "静守本心，默默生辉，自成山海。",
      palette: ["#7763ff", "#38d7ff", "#17130f"]
    },
    {
      id: "ootder",
      name: "校园OOTDER",
      image: "./assets/personality-placeholder.png",
      tags: ["校园穿搭卷王", "氛围感达人", "审美在线", "精致随性"],
      portrait: "你不一定卷绩点，但一定卷穿搭。日常出门精致得体，穿搭审美在线，擅长用穿搭治愈校园平淡日常。不随波逐流、风格独特，是行走的校园氛围感天花板，把普通的校园日常过成专属时尚大片。",
      slogan: "穿搭有度，自有风格，岁岁精致。",
      palette: ["#ff5b4a", "#7763ff", "#b8f042"]
    },
    {
      id: "reliable",
      name: "最强大腿",
      image: "./assets/personality-placeholder.png",
      tags: ["小组兜底王", "全员抱大腿", "靠谱天花板", "团队救世主"],
      portrait: "用实力说话，全系公认的万能大腿，只要有你在，小组作业、课程展示、竞赛项目直接稳了。执行力强、实力能打、从不甩锅。大学四年，承包了无数的高分，是全员争相抱紧的靠谱战神。努力就是雕塑自己，今天的自己比昨天更强了呢！",
      slogan: "实力兜底前行，奔赴万丈前程。",
      palette: ["#b8f042", "#38d7ff", "#17130f"]
    },
    {
      id: "mature",
      name: "二旬大学生",
      image: "./assets/personality-placeholder.png",
      tags: ["心态老成", "人间清醒", "早熟通透", "佛系淡然"],
      portrait: "明明二十出头，却拥有三四十岁的成熟心态。看透内卷套路，拒绝无谓焦虑，不跟风内耗、不盲目攀比。待人处事稳重通透，情绪极度稳定，比同龄人更清醒、更克制，是大学里少见的“早熟型”通透选手。",
      slogan: "清醒自持，步履从容。",
      palette: ["#17130f", "#ffd84f", "#fff8ef"]
    },
    {
      id: "melancholy",
      name: "忧郁小猫猫",
      image: "./assets/personality-placeholder.png",
      tags: ["细腻敏感", "温柔哀人", "情绪浪漫", "易碎温柔"],
      portrait: "外表安静温顺，内心细腻柔软。共情能力超强，容易多想、偶尔emo，自带淡淡的忧郁氛围感。善良温柔、心思细腻，擅长治愈别人，却常常悄悄自愈自己。是校园里温柔又独特的易碎系浪漫选手。",
      slogan: "温柔自愈成长，微光亦可向阳。",
      palette: ["#7763ff", "#ffd84f", "#ffb6c9"]
    },
    {
      id: "sunny",
      name: "阳光开朗大学生",
      image: "./assets/personality-placeholder.png",
      tags: ["乐天派本体", "治愈系暖男/女", "积极元气", "永不内耗"],
      portrait: "校园正能量担当，主打一个心态超好、永远乐观。遇事不emo、受挫不摆烂，爱笑、爱分享、元气满满。能自愈、懂包容，用积极的情绪感染身边所有人，是照亮整个宿舍与班级的小太阳。",
      slogan: "心怀阳光，明朗坦荡，逐光而行。",
      palette: ["#ffd84f", "#ff5b4a", "#38d7ff"]
    }
  ],
  questions: [
    {
      text: "收到课程作业 / 报告通知，你的第一反应是？",
      options: [
        { label: "还有时间，到时候再说", resultId: "ddl" },
        { label: "啊，任务+1，没关系慢慢都会做完的", resultId: "mature" },
        { label: "我的作品就是我的名片！尽量提前做完，还能帮队友查漏补缺", resultId: "reliable" },
        { label: "作业吗？可是今天天气阴阴的不适合做作业", resultId: "melancholy" }
      ]
    },
    {
      text: "出门上课 / 逛校园，你在穿搭上的态度是？",
      options: [
        { label: "随便套上衣服就行，舒适第一", resultId: "mature" },
        { label: "人生就是舞台，每天都要闪亮出场", resultId: "ootder" },
        { label: "能低调就低调，不想被过多关注", resultId: "mystery" },
        { label: "穿得清爽亮眼，主打元气好心情", resultId: "sunny" }
      ]
    },
    {
      text: "班级/社团/寝室组织集体活动，你通常会？",
      options: [
        { label: "能不去就不去，一个人的世界最舒适", resultId: "mystery" },
        { label: "积极参加，和大家在一起真的很开心！", resultId: "sunny" },
        { label: "随缘参与，旁观为主，心态很平和", resultId: "mature" },
        { label: "勉强参加，独处时更容易胡思乱想", resultId: "melancholy" }
      ]
    },
    {
      text: "小组作业分工，队友频频划水，你会？",
      options: [
        { label: "无所谓，等到最后一起突击搞定", resultId: "ddl" },
        { label: "默默把空缺的任务接过来，全力兜底", resultId: "reliable" },
        { label: "心里有点难过，情绪悄悄低落", resultId: "melancholy" },
        { label: "坦然看待，顺其自然", resultId: "mature" },
        { label: "小组作业是啥？", resultId: "mystery" }
      ]
    },
    {
      text: "距离任务 DDL 还有三天，你现在进度如何？",
      options: [
        { label: "无，但是没事，这不是还有三天吗？", resultId: "ddl" },
        { label: "早已完成，顺便帮小组完善内容", resultId: "reliable" },
        { label: "进度缓慢，越临近越emo", resultId: "melancholy" },
        { label: "按部就班推进，内心毫无波澜", resultId: "mature" }
      ]
    },
    {
      text: "课余空闲时间，你更愿意怎么度过？",
      options: [
        { label: "必然是靓丽出门！逛逛吃吃！发精装朋友圈", resultId: "ootder" },
        { label: "独处，我自有我的安排", resultId: "mystery" },
        { label: "约朋友出去耍，休息就得热热闹闹的", resultId: "sunny" },
        { label: "安静放空，感受情绪包裹住自己", resultId: "melancholy" }
      ]
    },
    {
      text: "课堂上老师随机提问，你的状态是？",
      options: [
        { label: "疯狂低头，拜托不要和老师对上目光", resultId: "mystery" },
        { label: "从容思考，淡定作答", resultId: "reliable" },
        { label: "会不会不一定，但肯定给老师点儿回应", resultId: "sunny" },
        { label: "紧张不安，内心变得敏感忐忑", resultId: "melancholy" }
      ]
    },
    {
      text: "身边人都在卷成绩、卷竞赛，你的想法是？",
      options: [
        { label: "能参加就参加，但是不到最后一刻自己都不知道自己会完成什么", resultId: "ddl" },
        { label: "势在必得，并且有自己一口肉吃就有同伴一口汤喝", resultId: "reliable" },
        { label: "看透内卷，这种琐事不足以让我焦虑", resultId: "mature" },
        { label: "不参与内卷，我是混时尚圈的", resultId: "ootder" }
      ]
    },
    {
      text: "遇到不顺心的事，你的情绪表现是？",
      options: [
        { label: "人生啊~", resultId: "melancholy" },
        { label: "！不会吧！（不过一会心情就好了）", resultId: "sunny" },
        { label: "没事，事情都会过去的", resultId: "mature" },
        { label: "没空烦恼了！DDL来了！", resultId: "ddl" }
      ]
    },
    {
      text: "别人对你的第一印象，大多是？",
      options: [
        { label: "时尚弄潮儿", resultId: "ootder" },
        { label: "不爱说话，七分冷峻，三分漫不经心", resultId: "mystery" },
        { label: "靠谱踏实，是大家的靠山", resultId: "reliable" },
        { label: "有意思，跟你在一起苹果肌难以保持扁平", resultId: "sunny" }
      ]
    },
    {
      text: "宿舍日常相处，你属于哪一类？",
      options: [
        { label: "话不多，习惯独来独往", resultId: "mystery" },
        { label: "带动气氛，宿舍里的开心果", resultId: "sunny" },
        { label: "心思细腻，容易被小事影响心情", resultId: "melancholy" },
        { label: "处事成熟，调解矛盾、稳住氛围", resultId: "mature" }
      ]
    },
    {
      text: "需要组队完成难题项目，大家第一时间想到你，因为？",
      options: [
        { label: "总能在最后关头力挽狂澜", resultId: "ddl" },
        { label: "实力过硬，是全队最稳的后盾", resultId: "reliable" },
        { label: "审美过关，并且组队拍照也会很出片", resultId: "ootder" },
        { label: "性格温和，能包容所有人", resultId: "melancholy" }
      ]
    },
    {
      text: "周末出门，你最先考虑的是？",
      options: [
        { label: "穿搭！走到哪里都会引起他人侧目！", resultId: "ootder" },
        { label: "去哪里独处，享受安静时光", resultId: "mystery" },
        { label: "约好友聚会，热热闹闹玩一天", resultId: "sunny" },
        { label: "随便走走，安静感受周遭氛围", resultId: "melancholy" }
      ]
    },
    {
      text: "面对突如其来的临时任务，你会？",
      options: [
        { label: "拖到最后一刻再动手", resultId: "ddl" },
        { label: "二话不说接手，高效完成", resultId: "reliable" },
        { label: "内心烦躁，情绪变得低落", resultId: "melancholy" },
        { label: "淡定接受，从容安排时间", resultId: "mature" }
      ]
    },
    {
      text: "回顾大学生活，你觉得自己最典型的标签是？",
      options: [
        { label: "卡点大师，永远和 DDL 斗智斗勇", resultId: "ddl" },
        { label: "低调路人，多数时候默默独处", resultId: "mystery" },
        { label: "精致，穿搭从不敷衍", resultId: "ootder" },
        { label: "热心帮手，总在为身边人兜底", resultId: "reliable" }
      ]
    },
    {
      text: "你更偏爱哪种生活状态？",
      options: [
        { label: "拖延出来的时间都是自己的，效率能赶在截止前爆发", resultId: "ddl" },
        { label: "独来独往，我有我自己的节奏", resultId: "mystery" },
        { label: "精致的自己配得上美好的每一天", resultId: "ootder" },
        { label: "努力就是雕塑自己，今天的自己比昨天更强了呢！", resultId: "reliable" },
        { label: "看淡一切，面朝大海，春暖花开", resultId: "mature" },
        { label: "细腻温柔，认真感受着周围的所有情绪，这也是感受生活", resultId: "melancholy" },
        { label: "年轻人！燥起来呀！", resultId: "sunny" }
      ]
    }
  ]
};
