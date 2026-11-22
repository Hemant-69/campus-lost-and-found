import React from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Campus Lost & Found Hero">
      {/* Crisp & Clear Hand-drawn Vector Illustration Artwork */}
      <svg
        className={styles.art}
        viewBox="0 0 2576 947"
        role="img"
        aria-label="Illustration of a college building with a note reading Found: blue bag, Library, 2nd floor, surrounded by lost items such as a key, umbrella, notebook, bottle, sneaker, backpack, mitten, sock and card"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <path id="sp" d="M0-24Q3-3 24 0Q3 3 0 24Q-3 3-24 0Q-3-3 0-24Z" />
        </defs>

        {/* Ambient Doodle Accents (Stars & Sparkles) */}
        <g stroke="#231f1d" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M1469 86v32M1453 102h32M1340 243v28M1326 257h28M1041 301v28M1027 315h28M2336 357v28M2322 371h28M1489 776v28M1475 790h28M105 811v28M91 825h28" />
          <circle cx="2500" cy="330" r="6" />
          <path d="M1100 232C1078 228 1068 262 1088 272C1096 276 1100 262 1090 258M2425 430C2445 425 2460 440 2450 458C2444 464 2436 455 2442 450M1048 818C1060 790 1085 790 1085 808C1085 822 1068 815 1075 802C1080 790 1105 785 1112 795M240 862C215 860 210 890 228 898C240 900 242 880 230 880M2445 105C2455 90 2480 95 2490 110C2495 122 2475 128 2470 118C2465 105 2495 95 2512 118C2520 130 2515 150 2500 160" />
        </g>
        <g fill="#e8b232" stroke="#231f1d" strokeWidth="2.5" strokeLinejoin="round">
          <use href="#sp" transform="translate(1268 145) scale(.85)" />
          <use href="#sp" transform="translate(703 521) scale(.8)" />
          <use href="#sp" transform="translate(736 513) scale(.35)" />
          <use href="#sp" transform="translate(729 551) scale(.5)" />
          <use href="#sp" transform="translate(1296 860) scale(.9)" />
        </g>
        <use href="#sp" transform="translate(58 536)" fill="none" stroke="#c9c0ae" strokeWidth="2.5" />
        <use href="#sp" transform="translate(55 606) scale(.4)" fill="none" stroke="#231f1d" strokeWidth="5" />

        {/* Crisp Vector Artwork Group (Clean, smooth, razor-sharp lines without rasterization filter) */}
        <g
          fill="none"
          stroke="#231f1d"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g strokeDasharray="9 14" strokeWidth="3.6">
            <path d="M972 432C1030 385 1110 392 1148 438C1180 480 1178 560 1150 602C1128 625 1085 620 1078 580C1072 530 1100 485 1132 466" />
            <path d="M1322 420C1350 428 1372 440 1392 462M1392 482C1335 520 1315 560 1320 600" />
            <path d="M1392 690C1470 668 1498 620 1488 570C1484 548 1490 545 1500 546C1540 560 1585 545 1610 510" />
            <path d="M1668 438C1700 432 1735 440 1755 456" />
            <ellipse cx="1558" cy="226" rx="33" ry="36" />
            <path d="M1585 262C1640 255 1670 235 1692 208M1565 262C1540 285 1500 305 1466 300" />
          </g>
          <path d="M1662 170L1762 140L1700 209L1688 185Z" fill="#fff9ea" />
          <path d="M1688 185L1762 140L1700 209Z" fill="#f2d48a" />
          <path d="M1688 185L1722 170" />
          <circle cx="2327" cy="195" r="77" fill="#e8b232" />
          <g fill="#fffaf0" strokeWidth="3.6">
            <path d="M2052 160C2040 160 2040 146 2058 144C2062 128 2085 125 2095 134C2100 112 2135 108 2145 130C2160 124 2185 128 2188 142C2205 145 2205 160 2190 160Z" />
            <path d="M2155 232C2146 232 2148 218 2165 216C2170 200 2192 196 2202 206C2210 190 2240 190 2246 208C2262 204 2285 210 2288 222C2290 232 2280 233 2270 233Z" />
            <path d="M2342 282C2334 282 2335 268 2352 266C2356 252 2378 248 2388 258C2396 238 2430 240 2436 260C2455 258 2478 264 2480 276C2480 283 2470 283 2462 283Z" />
          </g>
          {/* house */}
          <path d="M1720 362L1985 235L2255 362Z" fill="#c8472b" strokeWidth="5" />
          <rect x="1757" y="362" width="465" height="313" fill="#93c4a5" strokeWidth="5" />
          <g fill="#fff" strokeWidth="6">
            <rect x="1810" y="400" width="80" height="88" rx="6" />
            <rect x="1945" y="400" width="83" height="88" rx="6" />
            <rect x="2093" y="400" width="83" height="88" rx="6" />
            <rect x="1810" y="534" width="80" height="86" rx="6" />
            <rect x="2093" y="534" width="83" height="86" rx="6" />
          </g>
          <rect x="1935" y="515" width="107" height="80" rx="6" fill="#1d1a17" />
          <path d="M1663 675H2436" strokeWidth="5" />
          <circle cx="2362" cy="565" r="72" fill="#93c4a5" />
          <path d="M2362 637V675" />
          {/* backpack */}
          <path
            d="M1680 585C1680 555 1700 538 1720 538C1742 538 1762 555 1762 585V625C1762 638 1752 645 1740 645H1702C1690 645 1680 638 1680 625Z"
            fill="#a8d0b4"
          />
          <rect x="1696" y="596" width="50" height="34" rx="12" />
          <path d="M1695 570H1746M1708 540C1708 528 1735 528 1735 540" />
          {/* umbrella */}
          <g transform="rotate(-18 1240 440)">
            <path
              d="M1165 440C1168 395 1205 365 1240 365C1275 365 1312 395 1315 440C1300 430 1285 430 1277 440C1262 428 1248 428 1240 440C1232 428 1218 428 1203 440C1195 430 1178 430 1165 440Z"
              fill="#93c4a5"
            />
            <path
              d="M1240 365C1230 385 1215 420 1203 440C1218 428 1232 428 1240 440ZM1240 365C1250 385 1265 420 1277 440C1285 430 1300 430 1315 440C1312 395 1275 365 1240 365Z"
              fill="#e6d27c"
              stroke="none"
            />
            <path
              d="M1165 440C1168 395 1205 365 1240 365C1275 365 1312 395 1315 440C1300 430 1285 430 1277 440C1262 428 1248 428 1240 440C1232 428 1218 428 1203 440C1195 430 1178 430 1165 440ZM1240 365V440M1240 365C1230 385 1215 420 1203 440M1240 365C1250 385 1265 420 1277 440M1240 365V355"
            />
            <path d="M1240 440V500C1240 518 1264 518 1264 496" stroke="#c8472b" strokeWidth="9" />
          </g>
          {/* notebook + pen */}
          <g transform="rotate(-18 1457 475)">
            <rect x="1412" y="412" width="92" height="128" rx="8" fill="#e8b232" />
            <rect x="1430" y="432" width="58" height="32" rx="4" fill="#fff" strokeWidth="3.5" />
            <path d="M1432 482h50M1432 498h50M1432 514h34" strokeWidth="2.5" />
            <g fill="#fff" strokeWidth="3">
              <ellipse cx="1412" cy="424" rx="8" ry="4" />
              <ellipse cx="1412" cy="442" rx="8" ry="4" />
              <ellipse cx="1412" cy="460" rx="8" ry="4" />
              <ellipse cx="1412" cy="478" rx="8" ry="4" />
              <ellipse cx="1412" cy="496" rx="8" ry="4" />
              <ellipse cx="1412" cy="514" rx="8" ry="4" />
              <ellipse cx="1412" cy="532" rx="8" ry="4" />
            </g>
            <path d="M1488 418L1502 418L1500 500L1494 518L1488 500Z" fill="#93c4a5" strokeWidth="3.5" />
          </g>
          {/* bottle */}
          <g transform="rotate(-10 1620 430)">
            <path
              d="M1592 398C1592 388 1600 384 1604 382H1628C1632 384 1640 388 1640 398V472C1640 486 1630 496 1616 496C1602 496 1592 486 1592 472Z"
              fill="#eef6fb"
            />
            <rect x="1602" y="366" width="24" height="16" rx="3" fill="#cfe3f5" />
            <rect x="1592" y="418" width="48" height="40" fill="#7bb2de" strokeWidth="3.5" />
            <path d="M1616 428C1608 438 1608 446 1616 448C1624 446 1624 438 1616 428Z" fill="#e8892a" strokeWidth="2.5" />
          </g>
          {/* sneaker */}
          <g transform="rotate(22 1305 645)">
            <path
              d="M1250 662V618C1250 608 1256 604 1264 606L1290 612C1296 625 1305 632 1318 638C1340 642 1362 650 1366 662V666H1250Z"
              fill="#93c4a5"
            />
            <path d="M1296 618l12-8M1308 626l12-8M1320 634l12-8M1332 640l10-6" strokeWidth="3.5" />
            <path d="M1245 666H1368V680C1368 686 1362 689 1356 689H1255C1248 689 1245 685 1245 679Z" fill="#fff" />
          </g>
          {/* keys, arrow */}
          <g transform="translate(940 455) rotate(35)" fill="#e8b232">
            <path d="M20-7H92V8H82V24H70V8H60V24H48V8H20Z" />
            <circle r="24" />
            <circle r="9" fill="#f6eedc" />
          </g>
          <g transform="translate(2282 682) rotate(35)" fill="#e8b232">
            <path d="M16-6H78V7H70V20H60V7H52V20H42V7H16Z" />
            <circle r="18" />
            <circle r="7" fill="#f6eedc" />
          </g>
          <path
            d="M768 608C810 612 860 590 893 570L880 560L930 543L912 600L902 588C860 610 810 632 768 628Z"
            fill="#f0c24a"
            stroke="#231f1d"
            strokeWidth="3.5"
          />
          {/* mitten, sock, card, grass */}
          <g transform="rotate(-28 1785 765)">
            <path
              d="M1755 800C1742 770 1748 735 1778 728C1798 724 1808 740 1806 756C1812 748 1826 746 1830 758C1834 770 1820 790 1812 802Z"
              fill="#c8472b"
            />
            <path d="M1755 800H1812V826H1755Z" fill="#b53a22" />
            <path d="M1768 802V824M1780 802V824M1792 802V824M1804 802V824" strokeWidth="3" />
          </g>
          <g transform="rotate(20 2085 835)">
            <path
              d="M2062 800H2112V840C2112 850 2125 855 2132 862C2145 876 2130 892 2110 890H2065C2045 890 2040 870 2055 858C2062 850 2062 845 2062 835Z"
              fill="#fff"
            />
            <path d="M2060 790H2114V814H2060Z" fill="#c8472b" />
            <path d="M2072 792V812M2084 792V812M2096 792V812" strokeWidth="3" />
            <path d="M2046 868C2044 880 2054 890 2068 890H2090V872Z" fill="#c8472b" strokeWidth="3.5" />
          </g>
          <g transform="rotate(-15 2290 790)">
            <rect x="2248" y="755" width="92" height="62" rx="7" fill="#7bbbd8" />
            <path d="M2248 772H2340M2260 805h40" strokeWidth="3.5" />
            <rect x="2260" y="782" width="16" height="12" rx="2" fill="#e8b232" strokeWidth="3" />
          </g>
          <path d="M2236 774q-8 10-2 22M2224 768q-12 16-4 34" strokeWidth="3" />
          <path d="M1625 740l5-20 5 14 6-18 5 20 6-14 4 18M2422 735l5-20 8 14 6-16 8 22" strokeWidth="3.5" />
          <path d="M1632 738l3-14M2432 733l4-12" stroke="#93c4a5" strokeWidth="6" />
          {/* sign */}
          <g transform="rotate(-4 2032 670)">
            <rect x="1852" y="575" width="361" height="190" rx="12" fill="#fdf4d3" />
            <rect x="1985" y="570" width="70" height="30" fill="#8db8dc" strokeWidth="3" />
          </g>
        </g>
        <g transform="rotate(-4 2032 670)" fontFamily="var(--font-caveat), Caveat, cursive" fontWeight="600">
          <text x="1882" y="652" fontSize="46" fill="#231f1d">
            Found: blue bag
          </text>
          <text x="1882" y="708" fontSize="42" fill="#c8472b">
            Library, 2nd floor
          </text>
        </g>
      </svg>

      {/* Hero Content Overlay */}
      <div className={styles.copy}>
        <p className={styles.tag}>for students, by students</p>
        <h1 className={styles.title}>
          Lost it? Found it? Pin<br className={styles.brDesktop} />
          it here.
        </h1>
        <p className={styles.lede}>
          The college lost and found board, moved online. Post what you
          <br className={styles.brDesktop} />
          lost, or what you picked up, and we help it get back to the right
          <br className={styles.brDesktop} />
          hands.
        </p>
        <div className={styles.btns}>
          <Link href="/posts" className={`${styles.btn} ${styles.primary}`}>
            Browse found items
          </Link>
          <Link href="/posts/new" className={`${styles.btn} ${styles.ghost}`}>
            Post a lost item
          </Link>
        </div>
      </div>
    </section>
  );
}
