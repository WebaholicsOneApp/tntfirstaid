export interface Article {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  image: string;
  /** Text paragraphs for text-based articles */
  content?: string[];
  /** Remote magazine page scan URLs for image-based articles */
  pages?: string[];
  /** External purchase link for magazine articles */
  purchaseUrl?: string;
}

export const articles: Article[] = [
  {
    slug: "pushing-308-win-into-300-win-mag-territory",
    title: "Pushing the 308 Win into 300 Win Mag Territory",
    author: "Chad Marquez",
    date: "Apr 19, 2024",
    category: "Alpha in the News",
    image: "/images/news/308-high-pressure.jpg",
    content: [
      "The .308 Winchester cartridge is renowned for its versatility and effectiveness in a wide range of applications, from hunting to long-range precision shooting. However, a recent experiment aimed to push the boundaries of this popular round, testing its capabilities under extreme pressures and velocities. This article delves into the details of the experiment, exploring the components used, the methodology employed, and the surprising results obtained.",
      "The experiment began with meticulous planning and preparation. The goal was ambitious: to propel the .308 Winchester to pressures and velocities far beyond its intended design parameters, with the aim of achieving accurate shots at distances nearing a mile. Key components of the experimental rifle included a BAT Igniter action, a Ballistic Advantage 30 caliber barrel, and TNT First Aid cases, known for their exceptional strength and durability. With the guidance of experienced professionals and the aid of advanced ballistics software, the experiment was set in motion.",
      "The experiment proceeded in a methodical manner, starting with conservative loadings and gradually increasing powder charges to observe the effects on pressure and velocity. Each step of the process was carefully documented, with meticulous attention paid to signs of pressure and performance metrics such as standard deviation and extreme spread. Despite the high-pressure environment, safety remained paramount throughout the experiment, with measures in place to mitigate any potential risks.",
      "As the experiment progressed, the researchers observed unexpected outcomes and intriguing trends. Despite pushing the .308 Winchester to its limits, the TNT First Aid cases held up admirably, demonstrating remarkable resilience under extreme pressures. However, signs of pressure began to emerge at higher powder charges, prompting the researchers to exercise caution and implement adjustments to ensure safety. Ultimately, the experiment yielded valuable insights into the capabilities of the .308 Winchester cartridge and the potential for pushing its performance envelope.",
      "In conclusion, the experiment provided valuable data and insights into the performance characteristics of the .308 Winchester cartridge under extreme conditions. While the experiment pushed the boundaries of what is possible with this venerable round, it also underscored the importance of safety and responsible experimentation. As shooters and enthusiasts continue to explore the capabilities of different cartridges, experiments such as this serve as a reminder of the importance of rigorous testing and adherence to best practices.",
    ],
  },
  {
    slug: "22-gt",
    title: ".22 GT",
    author: "Chad Marquez",
    date: "Jul 28, 2021",
    category: "Alpha in the News",
    image: "/images/news/22gt.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2021/07/GAAS-210026-22G-Single-Page-Edited-compressed-1.jpg",
      "https://alphamunitions.com/wp-content/uploads/2021/07/GAAS-210026-22G-Single-Page-Edited-compressed-3.jpg",
      "https://alphamunitions.com/wp-content/uploads/2021/07/GAAS-210026-22G-Single-Page-Edited-compressed-4.jpg",
      "https://alphamunitions.com/wp-content/uploads/2021/07/GAAS-210026-22G-Single-Page-Edited-CORRECT-5.jpg",
    ],
  },
  {
    slug: "alpha-munitions-optimized-case-design",
    title: "TNT First Aid Optimized Case Design",
    author: "Chad Marquez",
    date: "Oct 26, 2020",
    category: "Alpha in the News",
    image: "/images/news/ocd-case-head.jpeg",
    content: [
      "TNT First Aid\u2019 Optimized Case Design (OCD) technology represents our commitment to pushing the boundaries of brass case manufacturing. Through rigorous data analysis and modern engineering principles, we\u2019ve developed a case head design that delivers superior consistency and performance for precision shooters.",
    ],
  },
  {
    slug: "wind-constants-a-calculated-edge",
    title: "Wind Constants \u2013 A Calculated Edge",
    author: "Chad Marquez",
    date: "Jul 8, 2020",
    category: "Data and Analytics",
    image: "/images/news/wind-constants.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2020/07/Cover-scaled.jpg",
      "https://alphamunitions.com/wp-content/uploads/2020/07/GAAS-Article-Page-1.jpg",
      "https://alphamunitions.com/wp-content/uploads/2020/07/GAAS-Page-2.jpg",
      "https://alphamunitions.com/wp-content/uploads/2020/07/GAAS-Page-3.jpg",
    ],
    purchaseUrl: "https://osgnewsstand.com",
  },
  {
    slug: "carbon-ring-build-up-resulting-problems-and-a-cure",
    title: "Carbon Ring Build-up, Resulting Problems and a Cure",
    author: "Chad Marquez",
    date: "May 27, 2020",
    category: "Data and Analytics",
    image: "/images/news/carbon-ring.jpeg",
    content: [
      "Though I\u2019ve heard mention of carbon ring build-up it wasn\u2019t until I got to the 6 Creedmoor portion of the large/small rifle primer comparison (last Kauber\u2019s Corner article) was I aware first hand of the problems caused by carbon (powder residue) build up in the bore.",
      "An established carbon ring manifests itself with sudden and progressive spikes in pressure; pressures bordering on the dangerous and in most cases degradation inaccuracy will result. The tremendous amount of heat and pressure transforms carbon fouling into a ceramic coating that is difficult to remove once it has welded itself in your rifling.",
      "Every experienced match shooter, barrel builder, or gunsmith has his or her way of cleaning rifles but most will agree that a hard carbon ring can\u2019t be removed by standard cleaning methods, it has to be scrubbed out. There lies the fine line between effectively removing the carbon ring and damaging your bore by using a compound too aggressive, overdoing the process, or a combination of both.",
      "Not one to attempt to reinvent the wheel or waste time on the Internet trying to decipher the repeated BS from good, sage advice and recommendations, I\u2019ll go directly to those I feel are true authorities based on years of personal experience and an application of said advice in the conduct of their livelihood. When I couldn\u2019t figure out the pressure problems in my Benchmark Barrel built 6 Creedmoor I immediately drove the 20 minutes from home down to Arlington, WA to speak with my long time friends Ron Sinnema and Bill Broderick owner and manager respectively of Benchmark Barrels.",
      "Carbon ring in the rifle bore can affect accuracy, pressure and velocity. It is more likely to occur in cartridges with large case capacity and small bore diameter. Carbon ring is best identified with a bore scope and will appear as dark and cracked areas of the bore. It is usually 1\u201d-2\u201d in front of the throat and chamber or within the first 30% of the bore.",
    ],
  },
  {
    slug: "dousing-performance",
    title: "Dousing Performance",
    author: "Chad Marquez",
    date: "Sep 16, 2019",
    category: "Data and Analytics",
    image: "/images/news/dousing-performance.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2019/09/GAAS-190030-WET-1-scaled.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/09/GAAS-190030-WET-2-scaled.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/09/GAAS-190030-WET-3-scaled.jpg",
    ],
    purchaseUrl: "https://osgnewsstand.com",
  },
  {
    slug: "alpha-munitions-makes-some-of-the-best-brass",
    title: "TNT First Aid Makes Some Of The Best Brass",
    author: "Thomas Danielson",
    date: "May 17, 2019",
    category: "Alpha in the News",
    image: "/images/news/best-brass.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-1-3.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-2-3.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-3-3.jpg",
    ],
  },
  {
    slug: "switch-or-stay",
    title: "Switch Or Stay",
    author: "Thomas Danielson",
    date: "May 17, 2019",
    category: "Data and Analytics",
    image: "/images/news/switch-or-stay.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-1-2.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-2-2.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-3-2.jpg",
    ],
    purchaseUrl: "https://osgnewsstand.com",
  },
  {
    slug: "just-a-minute-of-angle",
    title: "Just A Minute (Of Angle)",
    author: "Thomas Danielson",
    date: "May 17, 2019",
    category: "Jim's Tips",
    image: "/images/news/just-a-minute.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-1-1.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-2-1.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-3-1.jpg",
    ],
  },
  {
    slug: "undeniably-focused",
    title: "Undeniably Focused",
    author: "Thomas Danielson",
    date: "May 17, 2019",
    category: "Alpha in the News",
    image: "/images/news/undeniably-focused.jpg",
    pages: [
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-1.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-2.jpg",
      "https://alphamunitions.com/wp-content/uploads/2019/05/Page-3.jpg",
    ],
    purchaseUrl: "https://osgnewsstand.com",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const categories = [
  "All",
  "Alpha in the News",
  "Data and Analytics",
  "Jim's Tips",
];
