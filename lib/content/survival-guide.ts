export const survivalFilters = ["全部", "职场修炼", "生活起居", "出行指南"] as const;

export type SurvivalFilter = (typeof survivalFilters)[number];
export type SurvivalLessonCategory = Exclude<SurvivalFilter, "全部">;
export type SurvivalLessonDifficulty = "Easy" | "Medium" | "Hard";

export interface SurvivalLessonStep {
  title: string;
  detail: string;
}

export interface SurvivalLessonLink {
  label: string;
  href: string;
}

export interface SurvivalLesson {
  id: number;
  category: SurvivalLessonCategory;
  title: string;
  difficulty: SurvivalLessonDifficulty;
  icon: "Home" | "Briefcase" | "Banknote" | "Wifi" | "Cross" | "Plane" | "Package" | "FileText" | "ShoppingCart";
  progressSlug: string;
  estimatedMinutes: number;
  accent: "amber" | "peach" | "mint" | "sky" | "rose" | "sand";
  summary: string;
  tldr: string;
  steps: SurvivalLessonStep[];
  proTips: string[];
  links: SurvivalLessonLink[];
}

export const survivalGuideLessons: SurvivalLesson[] = [
  {
    id: 1,
    category: "生活起居",
    title: "怎么租房与退租押金",
    difficulty: "Hard",
    icon: "Home",
    progressSlug: "how-to-rent-house",
    estimatedMinutes: 8,
    accent: "amber",
    summary: "第一次租房最怕的不是房子一般，而是签之前没问透、搬走时没留证，最后押金被扣得莫名其妙。",
    tldr: "先问总成本和退租规则，再签字；入住、退租都要把现场和聊天留成证据。",
    steps: [
      {
        title: "看房前先算自己的底线",
        detail: "把预算、通勤时间、能不能接受合租、租期长短先写清，不要到现场才被房东和中介带节奏。",
      },
      {
        title: "看房时只盯四件大事",
        detail: "除了房租本身，还要追问押金怎么退、水电按民用还是商用、网费和物业怎么算、家具家电坏了谁负责修。",
      },
      {
        title: "签约和退租都留图留字",
        detail: "入住前拍墙面、地板、家电、门锁；退租时提前文字通知、补齐账单、让对方在聊天里确认验房结果和押金时间。",
      },
    ],
    proTips: [
      "对方催你先交定金、合同稍后发，这种节奏要立刻放慢。",
      "“押金看情况退”这种口头承诺几乎等于没承诺，必须写进文本。",
      "短租却被推年付宽带、商业水电、维修责任模糊，都是后面很容易吃亏的点。",
    ],
    links: [
      { label: "完整租房场景", href: "/scenario/how-to-rent-house" },
      { label: "退租押金细节", href: "/scenario/rent-deposit-return" },
      { label: "租房高级工具", href: "/rent/tools" },
    ],
  },
  {
    id: 2,
    category: "职场修炼",
    title: "什么是五险一金",
    difficulty: "Hard",
    icon: "Briefcase",
    progressSlug: "what-is-insurance-housing-fund",
    estimatedMinutes: 9,
    accent: "mint",
    summary: "很多人第一次拿工资条，最先震惊的是被扣了一笔钱；真正重要的是搞清楚这笔钱有没有按时、按真实基数缴进去。",
    tldr: "五险一金不是神秘扣款，而是社保加公积金；重点不是背定义，而是学会看工资条、查缴费记录、识别公司在不在认真缴。",
    steps: [
      {
        title: "入职前先问缴纳规则",
        detail: "别只问“交不交”，还要问入职当月还是次月开始交、缴纳城市在哪、是按什么基数算、公积金比例是多少。",
      },
      {
        title: "拿到工资条先拆结构",
        detail: "把税前工资、五险一金、个税分开看。五险一金是保障和住房储备，个税是另外一笔，别把它们混成“公司扣钱”。",
      },
      {
        title: "去官方渠道查是不是真的缴了",
        detail: "社保看参保和缴费记录，公积金看账户余额和月缴存。真正稳妥的动作不是听 HR 说“有交”，而是自己查一次。",
      },
      {
        title: "换工作和毕业时盯住断缴风险",
        detail: "城市切换、身份切换、试用期拖延缴纳，都是新手最容易忽视的坑。你不需要懂政策大全，但要知道自己有没有被中断。",
      },
    ],
    proTips: [
      "公司说“转正以后再交”时，至少要继续追问试用期这几个月怎么算、有没有补缴安排。",
      "只告诉你到手工资，不告诉社保基数和公积金比例，说明信息透明度不够。",
      "工资条上有扣款，不代表公司真的缴了；最怕的是“只扣不缴”，所以一定要自己查记录。",
    ],
    links: [
      { label: "完整五险一金指南", href: "/scenario/what-is-insurance-housing-fund" },
      { label: "配合工资条一起看", href: "/scenario/read-first-pay-slip" },
      { label: "社保速查卡", href: "/toolkit" },
    ],
  },
  {
    id: 3,
    category: "职场修炼",
    title: "什么是薪资结构",
    difficulty: "Medium",
    icon: "Banknote",
    progressSlug: "salary-structure",
    estimatedMinutes: 7,
    accent: "sand",
    summary: "真正决定你每个月活得舒不舒服的，不是 offer 上最大的数字，而是固定部分、浮动部分和扣款项到底怎么构成。",
    tldr: "先看固定工资，再看浮动绩效，最后算五险一金和个税；别被“总包”两个字糊住眼。",
    steps: [
      {
        title: "先把收入分三格",
        detail: "固定工资、浮动绩效/奖金、补贴福利分开记。只有固定工资最接近你稳定能拿到的钱。",
      },
      {
        title: "追问口径，不要只听总数",
        detail: "把发薪日、试用期工资、绩效发放规则、年终奖条件问清楚，避免把“可能有”当成“肯定有”。",
      },
      {
        title: "工资条拿到手后对一遍",
        detail: "核对固定收入、考勤扣款、五险一金、个税和补贴是否跟最初说法一致，有偏差就尽快问。",
      },
    ],
    proTips: [
      "绩效占比过高、却没有清晰考核规则，意味着到手波动会很大。",
      "把餐补、房补、交通补都包装成薪资亮点，但实际不稳定，这类数字要打折看。",
      "面试阶段不好意思问清楚，往往会在第一次发工资时集中后悔。",
    ],
    links: [
      { label: "完整薪资结构指南", href: "/scenario/salary-structure" },
      { label: "第一次看工资条", href: "/scenario/read-first-pay-slip" },
      { label: "工资模板工具", href: "/toolkit" },
    ],
  },
  {
    id: 4,
    category: "生活起居",
    title: "怎么办宽带与查水电",
    difficulty: "Easy",
    icon: "Wifi",
    progressSlug: "check-utilities",
    estimatedMinutes: 5,
    accent: "sky",
    summary: "独立生活一开始最容易手忙脚乱的，不是不会交钱，而是连“谁收钱、去哪查、会不会被绑定长约”都没搞清楚。",
    tldr: "先确认收费主体和规则，再开宽带、查水电；入口找对了，这件事其实不难。",
    steps: [
      {
        title: "先问谁在收费",
        detail: "水电可能是物业代收、官方平台直缴，也可能房东转收。没搞清这点，就会一直在错的入口里乱找。",
      },
      {
        title: "宽带先问能不能装和合约多久",
        detail: "短租最怕被办成年合约。安装费、设备押金、提前退订规则都要先问，再决定要不要办。",
      },
      {
        title: "把账号和记录存起来",
        detail: "户号、缴费入口、账单截图、聊天记录都留着，后面催费、断网或退租时会省很多事。",
      },
    ],
    proTips: [
      "商业水电和民水民电价格差很多，不提前问，月底最容易被吓到。",
      "宽带首月免费常常伴随更长合约，短租用户尤其要谨慎。",
      "没有户号和截图，后面一旦扯账单，就很难说清前后责任。",
    ],
    links: [
      { label: "查水电完整指南", href: "/scenario/check-utilities" },
      { label: "装宽带完整指南", href: "/scenario/install-broadband" },
      { label: "入住后缴费顺序", href: "/scenario/pay-rent-utilities" },
    ],
  },
  {
    id: 5,
    category: "生活起居",
    title: "怎么看病与医保报销",
    difficulty: "Hard",
    icon: "Cross",
    progressSlug: "go-to-hospital",
    estimatedMinutes: 8,
    accent: "rose",
    summary: "第一次自己去医院，最慌的往往不是病本身，而是不知道挂哪个科、先去哪缴费、医保到底能不能直接报。",
    tldr: "先把挂号流程走顺，再确认医保结算方式；你不需要装懂，按顺序问就行。",
    steps: [
      {
        title: "出门前准备三样东西",
        detail: "身份证或医保码、手机支付方式、症状时间线。能把发病时间、主要症状和用药情况说清，现场就会顺很多。",
      },
      {
        title: "到医院先解决挂号和流程",
        detail: "不知道挂什么科就去导诊台描述症状，不用自己瞎判断；顺便问清缴费、检查和取药大概怎么走。",
      },
      {
        title: "看完病再看医保结算",
        detail: "确认这次是直接刷医保、部分自费还是后续报销，票据和病历别乱丢，异地就医时更要留好。",
      },
    ],
    proTips: [
      "很多人以为有医保就一定自动报销，实际还要看参保类型、就医地和结算方式。",
      "异地看病前不确认规则，后面最容易出现“能看不能报”或者流程特别绕。",
      "症状严重、呼吸困难、高烧不退、持续呕吐这类情况，不要硬撑着慢慢研究流程。",
    ],
    links: [
      { label: "第一次去医院", href: "/scenario/go-to-hospital" },
      { label: "医保到底怎么用", href: "/scenario/what-is-medical-insurance" },
      { label: "看病准备清单", href: "/toolkit" },
    ],
  },
  {
    id: 6,
    category: "出行指南",
    title: "如何坐高铁/飞机",
    difficulty: "Easy",
    icon: "Plane",
    progressSlug: "take-high-speed-rail",
    estimatedMinutes: 6,
    accent: "sky",
    summary: "第一次独自远行，最容易出错的不是不会买票，而是站名、航站楼、安检规则和到达时间一个都没提前确认。",
    tldr: "认准地点、时间、证件和行李规则，剩下就是跟着流程走。",
    steps: [
      {
        title: "出发前核对站点和证件",
        detail: "高铁看清是哪个站、哪个检票口；飞机先确认航站楼和值机时间，身份证和电子票据都别等到现场才找。",
      },
      {
        title: "提前到，按顺序走流程",
        detail: "高铁按安检、候车、检票上车；飞机按值机、托运、安检、登机。第一次出远门，提前到就是最有效的保险。",
      },
      {
        title: "上车登机后别彻底放空",
        detail: "再确认座位、到达站和下车下机时间，尤其换乘、转机和靠近终点站时更要盯一眼。",
      },
    ],
    proTips: [
      "“南站、东站、西站”这种差一个字就足够让你跑错地方。",
      "飞机液体、充电宝和托运行李规则没看，安检口最容易卡住。",
      "第一次坐高铁或飞机，不要赌自己能卡点赶上；路上一个小意外就够翻车。",
    ],
    links: [
      { label: "高铁完整流程", href: "/scenario/take-high-speed-rail" },
      { label: "飞机完整流程", href: "/scenario/take-airplane" },
      { label: "陌生城市 24 小时清单", href: "/toolkit" },
    ],
  },
  {
    id: 7,
    category: "生活起居",
    title: "怎么寄快递与维权",
    difficulty: "Medium",
    icon: "Package",
    progressSlug: "send-courier",
    estimatedMinutes: 6,
    accent: "peach",
    summary: "快递这件事看起来小，但新手最常见的亏不是多花几块钱，而是出问题时手里没有任何证据能维权。",
    tldr: "寄出前问价格和保价，寄出后留底单和单号；丢件时先登记、再催时限。",
    steps: [
      {
        title: "寄出前先问清楚",
        detail: "重量、时效、是否保价、到付还是现付都别省略。你越清楚，门店越难用模糊说法带过。",
      },
      {
        title: "寄出后立刻留底",
        detail: "快递单号、称重照片、支付记录、聊天截图至少留一份。之后真出问题，证据都是从这一刻开始的。",
      },
      {
        title: "丢件或少件时同步投诉",
        detail: "平台和快递公司一起登记，明确表达你要工单号、赔付规则和回复时限，不要只接受一句“再等等”。",
      },
    ],
    proTips: [
      "没有保价和价值证明时，赔付空间通常会被压得很低。",
      "只和门店口头沟通、不走工单流程，后续最容易变成谁都不认账。",
      "维权不是先吵，而是先把订单、时间线和诉求整理清楚。",
    ],
    links: [
      { label: "寄快递完整指南", href: "/scenario/send-courier" },
      { label: "丢件怎么维权", href: "/scenario/courier-lost-claim" },
      { label: "快递投诉模板", href: "/toolkit" },
    ],
  },
  {
    id: 8,
    category: "职场修炼",
    title: "什么是三方合同",
    difficulty: "Hard",
    icon: "FileText",
    progressSlug: "what-is-tripartite-agreement",
    estimatedMinutes: 7,
    accent: "mint",
    summary: "应届生最容易因为“反正后面还能换”而草率签三方，但它虽然不是劳动合同，也绝对不是随便签着玩的纸。",
    tldr: "三方协议不是正式劳动合同，但它会影响你的就业去向和违约成本，签之前至少把岗位、地点、时间和违约条款看清。",
    steps: [
      {
        title: "先确认它到底在约定什么",
        detail: "三方主要约定的是毕业去向和就业关系，不等于入职后的全部劳动条款，所以不能拿一个文件去脑补另一个文件。",
      },
      {
        title: "把文本和口头说法逐条对",
        detail: "岗位、工作地点、薪资口径、入职时间、违约处理方式，只要有一项对不上，就别因为着急而直接签。",
      },
      {
        title: "有疑问先问学校和 HR",
        detail: "尤其涉及毁约、改派、应届身份这些问题时，不懂就去问，不要把“先签了再说”当成熟。",
      },
    ],
    proTips: [
      "最危险的情况是 HR 口头承诺一套、纸面文本另一套，还催你今天必须签。",
      "把三方当劳动合同或者完全不看违约条款，都会让你后面很被动。",
      "涉及应届身份、户口档案、改派流程时，学校就业办通常比同学群更靠谱。",
    ],
    links: [
      { label: "完整三方协议指南", href: "/scenario/what-is-tripartite-agreement" },
      { label: "顺手补看薪资结构", href: "/scenario/salary-structure" },
      { label: "路线：毕业找工作", href: "/paths" },
    ],
  },
  {
    id: 9,
    category: "生活起居",
    title: "怎么挑菜与处理发霉食物",
    difficulty: "Easy",
    icon: "ShoppingCart",
    progressSlug: "food-mold-or-poisoning",
    estimatedMinutes: 4,
    accent: "peach",
    summary: "开始自己买菜做饭之后，最真实的问题不是菜谱，而是怎么快速判断食材还能不能吃，吃坏了又该怎么办。",
    tldr: "软质食物发霉就别赌，宁可扔；如果已经吃坏肚子，先判断症状，再决定观察还是就医。",
    steps: [
      {
        title: "买菜先挑状态稳定的",
        detail: "颜色自然、没有黏液、没有怪味、包装完整，比所谓“便宜一点点”更重要。第一次自己买菜，先买容易判断的新鲜食材。",
      },
      {
        title: "发现发霉先停吃",
        detail: "尤其面包、水果、熟食、豆制品这类软质食物，不是削掉表面就一定安全，最稳妥就是直接处理掉。",
      },
      {
        title: "出现明显症状及时评估",
        detail: "轻微不适先补水和休息；如果持续呕吐、腹泻、高烧、脱水或症状越来越重，就别硬扛，尽快去医院。",
      },
    ],
    proTips: [
      "“闻起来还行”“削掉霉点就能吃”是很多人翻车前最常见的自我安慰。",
      "一个人独居时更要记录吃了什么、什么时候开始不舒服，真去看病时非常有用。",
      "节省不是把明显坏掉的食物硬吃掉，真正省心是避免一次食物中毒把整周安排打乱。",
    ],
    links: [
      { label: "发霉食物怎么办", href: "/scenario/food-mold-or-poisoning" },
      { label: "不舒服时去医院", href: "/scenario/go-to-hospital" },
      { label: "完整生活分类", href: "/categories/life-admin" },
    ],
  },
];

export function getSurvivalRank(percentage: number) {
  if (percentage >= 100) {
    return "独立生存大师";
  }

  if (percentage >= 61) {
    return "社会毒打幸存者";
  }

  if (percentage >= 31) {
    return "职场摸鱼实习生";
  }

  return "纯血清澈大学生";
}
