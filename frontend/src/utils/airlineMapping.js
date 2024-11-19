const airlineMapping = {
    // A
    AA: {
      name: 'American Airlines',
      logo: 'https://logo.clearbit.com/americanairlines.com',
    },
    AC: {
      name: 'Air Canada',
      logo: 'https://logo.clearbit.com/aircanada.com',
    },
    AF: {
      name: 'Air France',
      logo: 'https://logo.clearbit.com/airfrance.com',
    },
    AI: {
      name: 'Air India',
      logo: 'https://logo.clearbit.com/airindia.in',
    },
    AZ: {
      name: 'Alitalia',
      logo: 'https://logo.clearbit.com/alitalia.com',
    },
    AS: {
      name: 'Alaska Airlines',
      logo: 'https://logo.clearbit.com/alaskaair.com',
    },
    AY: {
      name: 'Finnair',
      logo: 'https://logo.clearbit.com/finnair.com',
    },
    // B
    BA: {
      name: 'British Airways',
      logo: 'https://logo.clearbit.com/britishairways.com',
    },
    BI: {
      name: 'Binter Canarias',
      logo: 'https://logo.clearbit.com/bintercanarias.com',
    },
    BG: {
      name: 'Biman Bangladesh Airlines',
      logo: 'https://logo.clearbit.com/biman-airlines.com',
    },
    // C
    CA: {
      name: 'Air China',
      logo: 'https://logo.clearbit.com/airchina.com.cn',
    },
    CX: {
      name: 'Cathay Pacific',
      logo: 'https://logo.clearbit.com/cathaypacific.com',
    },
    CI: {
      name: 'China Airlines',
      logo: 'https://logo.clearbit.com/chinalinestars.com.tw',
    },
    CZ: {
      name: 'China Southern Airlines',
      logo: 'https://logo.clearbit.com/chinasouthern.com',
    },
    DL: {
      name: 'Delta Air Lines',
      logo: 'https://logo.clearbit.com/delta.com',
    },
    EK: {
      name: 'Emirates',
      logo: 'https://logo.clearbit.com/emirates.com',
    },
    ET: {
      name: 'Ethiopian Airlines',
      logo: 'https://logo.clearbit.com/ethiopianairlines.com',
    },
    // F
    F9: {
      name: 'Frontier Airlines',
      logo: 'https://logo.clearbit.com/frontier.com',
    },
    FI: {
      name: 'Finnair',
      logo: 'https://logo.clearbit.com/finnair.com',
    },
    // G
    GA: {
      name: 'Garuda Indonesia',
      logo: 'https://logo.clearbit.com/garuda-indonesia.com',
    },
    // H
    HA: {
      name: 'Hawaiian Airlines',
      logo: 'https://logo.clearbit.com/hawaiianairlines.com',
    },
    HR: {
      name: 'Horizon Air',
      logo: 'https://logo.clearbit.com/horizonair.com',
    },
    HU: {
      name: 'Hainan Airlines',
      logo: 'https://logo.clearbit.com/hainanairlines.com',
    },
    // I
    IB: {
      name: 'Iberia',
      logo: 'https://logo.clearbit.com/iberia.com',
    },
    JL: {
      name: 'Japan Airlines',
      logo: 'https://logo.clearbit.com/jal.co.jp',
    },
    KA: {
      name: 'Korean Air',
      logo: 'https://logo.clearbit.com/koreanair.com',
    },
    KL: {
      name: 'KLM Royal Dutch Airlines',
      logo: 'https://logo.clearbit.com/klm.com',
    },
    // L
    LH: {
      name: 'Lufthansa',
      logo: 'https://logo.clearbit.com/lufthansa.com',
    },
    // M
    MH: {
      name: 'Malaysia Airlines',
      logo: 'https://logo.clearbit.com/malaysiaairlines.com',
    },
    MS: {
      name: 'EgyptAir',
      logo: 'https://logo.clearbit.com/egyptair.com',
    },
    MU: {
      name: 'China Eastern Airlines',
      logo: 'https://cdn.airpaz.com/rel-0275/airlines/201x201/MU.png',
    },
    // N
    NH: {
      name: 'All Nippon Airways (ANA)',
      logo: 'https://logo.clearbit.com/ana.co.jp',
    },
    // Q
    QR: {
      name: 'Qatar Airways',
      logo: 'https://logo.clearbit.com/qatarairways.com',
    },
    // R
    RU: {
      name: 'Aeroflot',
      logo: 'https://logo.clearbit.com/aeroflot.ru',
    },
    // S
    SQ: {
      name: 'Singapore Airlines',
      logo: 'https://logo.clearbit.com/singaporeair.com',
    },
    SN: {
      name: 'Brussels Airlines',
      logo: 'https://logo.clearbit.com/brusselsairlines.com',
    },
    LX: {
      name: 'Swiss International Air Lines',
      logo: 'https://logo.clearbit.com/swiss.com',
    },
    SU: {
      name: 'Aeroflot',
      logo: 'https://logo.clearbit.com/aeroflot.ru',
    },
    SV: {
      name: 'Avianca',
      logo: 'https://logo.clearbit.com/avianca.com',
    },
    // T
    TK: {
      name: 'Turkish Airlines',
      logo: 'https://logo.clearbit.com/turkishairlines.com',
    },
    TP: {
      name: 'TAP Air Portugal',
      logo: 'https://logo.clearbit.com/tap.pt',
    },
    // U
    UA: {
      name: 'United Airlines',
      logo: 'https://logo.clearbit.com/united.com',
    },
    LO: {
        name: 'LOT Polish Airlines',
        logo: 'https://logo.clearbit.com/lot.com',
    },
    // V
    VS: {
      name: 'Virgin Atlantic',
      logo: 'https://logo.clearbit.com/virginatlantic.com',
    },
    // W
    WN: {
      name: 'Southwest Airlines',
      logo: 'https://logo.clearbit.com/southwest.com',
    },
    // Z
    ZX: {
      name: 'American Eagle',
      logo: 'https://logo.clearbit.com/americanairlines.com',
    },
    // Additional Airlines
    B6: {
      name: 'JetBlue Airways',
      logo: 'https://logo.clearbit.com/jetblue.com',
    },
    SY: {
      name: 'Sun Country Airlines',
      logo: 'https://logo.clearbit.com/suncountry.com',
    },
    // Add more airlines as needed
    // Handle any custom or non-standard carrier codes
    U: {
      name: 'Unknown Carrier',
      logo: 'https://via.placeholder.com/100?text=No+Logo',
    },
};

export default airlineMapping;
