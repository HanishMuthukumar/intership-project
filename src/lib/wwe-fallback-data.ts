export interface FallbackQuestion {
  id: string;
  body: string;
  author: string;
  tags: string[];
  votes: number;
}

export interface FallbackSolution {
  id: string;
  question_id: string;
  body: string;
  author: string;
  is_accepted: boolean;
  votes: number;
}

export const FALLBACK_QUESTIONS: FallbackQuestion[] = [
  {
    id: "wwe-q-1",
    body: "Who is known as 'The Deadman' in WWE?",
    author: "QuizMaster",
    tags: ["Legends"],
    votes: 42
  },
  {
    id: "wwe-q-2",
    body: "Which WWE superstar has won the most Royal Rumble matches?",
    author: "WWEFan",
    tags: ["Royal Rumble", "Legends"],
    votes: 38
  },
  {
    id: "wwe-q-3",
    body: "In which year did The Rock win his first WWE Championship?",
    author: "RockFan",
    tags: ["Champions", "Legends"],
    votes: 29
  },
  {
    id: "wwe-q-4",
    body: "What is the name of John Cena's finishing move?",
    author: "CenaFan",
    tags: ["Legends", "General"],
    votes: 55
  },
  {
    id: "wwe-q-5",
    body: "Which tag team is known as 'The Brothers of Destruction'?",
    author: "TagTeamFan",
    tags: ["Tag Teams", "Legends"],
    votes: 31
  },
  {
    id: "wwe-q-6",
    body: "Who was the first-ever Universal Champion?",
    author: "UniversalFan",
    tags: ["Champions"],
    votes: 24
  },
  {
    id: "wwe-q-7",
    body: "At which WrestleMania did The Undertaker lose his undefeated streak?",
    author: "StreakFan",
    tags: ["WrestleMania", "Legends"],
    votes: 67
  },
  {
    id: "wwe-q-8",
    body: "Which superstar goes by the nickname 'The Beast Incarnate'?",
    author: "BeastFan",
    tags: ["Champions", "Legends"],
    votes: 40
  },
  {
    id: "wwe-q-9",
    body: "What is the signature submission move of Chris Jericho?",
    author: "JerichoFan",
    tags: ["Legends", "General"],
    votes: 19
  },
  {
    id: "wwe-q-10",
    body: "Who challenged The Undertaker at WrestleMania 28 in a 'Hell in a Cell' match?",
    author: "HBKFan",
    tags: ["WrestleMania", "Rivalries"],
    votes: 33
  },
  {
    id: "wwe-q-11",
    body: "Which PPV event features a 30-man Royal Rumble match annually?",
    author: "PPVFan",
    tags: ["PPV Events", "Royal Rumble"],
    votes: 27
  },
  {
    id: "wwe-q-12",
    body: "How many times has Triple H won the WWE World Championship?",
    author: "HHHFan",
    tags: ["Champions", "Legends"],
    votes: 22
  },
  {
    id: "wwe-q-13",
    body: "What is Roman Reigns' famous battle cry catchphrase?",
    author: "ReignsFan",
    tags: ["Champions", "General"],
    votes: 48
  },
  {
    id: "wwe-q-14",
    body: "Who was the original member of nWo alongside Hollywood Hogan and Scott Hall?",
    author: "NWOFan",
    tags: ["Legends", "Rivalries"],
    votes: 18
  },
  {
    id: "wwe-q-15",
    body: "Which superstar is called 'The Phenomenal One'?",
    author: "AJStylesFan",
    tags: ["Champions", "General"],
    votes: 35
  }
];

export const FALLBACK_SOLUTIONS: Record<string, FallbackSolution[]> = {
  "wwe-q-1": [
    {
      id: "sol-1-1",
      question_id: "wwe-q-1",
      body: "The Undertaker is known as 'The Deadman'. Debuting at Survivor Series 1990, he became one of the most legendary figures in wrestling history.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 34
    },
    {
      id: "sol-1-2",
      question_id: "wwe-q-1",
      body: "Kane, the Big Red Machine",
      author: "Challenger_8",
      is_accepted: false,
      votes: 6
    },
    {
      id: "sol-1-3",
      question_id: "wwe-q-1",
      body: "Mankind / Mick Foley",
      author: "Challenger_3",
      is_accepted: false,
      votes: 2
    }
  ],
  "wwe-q-2": [
    {
      id: "sol-2-1",
      question_id: "wwe-q-2",
      body: "Stone Cold Steve Austin won the Royal Rumble a record 3 times (1997, 1998, 2001).",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 28
    },
    {
      id: "sol-2-2",
      question_id: "wwe-q-2",
      body: "John Cena (won 2 times)",
      author: "WrestlingFan99",
      is_accepted: false,
      votes: 7
    },
    {
      id: "sol-2-3",
      question_id: "wwe-q-2",
      body: "Hulk Hogan",
      author: "VintageFan",
      is_accepted: false,
      votes: 3
    }
  ],
  "wwe-q-3": [
    {
      id: "sol-3-1",
      question_id: "wwe-q-3",
      body: "The Rock won his first WWE Championship in 1998 at Survivor Series in the 'Deadly Games' tournament.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 22
    },
    {
      id: "sol-3-2",
      question_id: "wwe-q-3",
      body: "WrestleMania 15 in 1999",
      author: "AttitudeEraFan",
      is_accepted: false,
      votes: 5
    }
  ],
  "wwe-q-4": [
    {
      id: "sol-4-1",
      question_id: "wwe-q-4",
      body: "Attitude Adjustment (AA), originally called the FU. He also utilizes the STF submission.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 45
    },
    {
      id: "sol-4-2",
      question_id: "wwe-q-4",
      body: "The Five Knuckle Shuffle",
      author: "CenaNation",
      is_accepted: false,
      votes: 8
    }
  ],
  "wwe-q-5": [
    {
      id: "sol-5-1",
      question_id: "wwe-q-5",
      body: "The Undertaker and Kane formed 'The Brothers of Destruction', managed by Paul Bearer.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 26
    },
    {
      id: "sol-5-2",
      question_id: "wwe-q-5",
      body: "The Dudley Boyz",
      author: "ECWFan",
      is_accepted: false,
      votes: 4
    }
  ],
  "wwe-q-6": [
    {
      id: "sol-6-1",
      question_id: "wwe-q-6",
      body: "Finn Bálor became the inaugural WWE Universal Champion at SummerSlam 2016 by defeating Seth Rollins.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 20
    },
    {
      id: "sol-6-2",
      question_id: "wwe-q-6",
      body: "Kevin Owens",
      author: "KOShow",
      is_accepted: false,
      votes: 3
    }
  ],
  "wwe-q-7": [
    {
      id: "sol-7-1",
      question_id: "wwe-q-7",
      body: "WrestleMania 30 (XXX) in 2014, where Brock Lesnar conquered Undertaker's 21-0 streak.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 58
    },
    {
      id: "sol-7-2",
      question_id: "wwe-q-7",
      body: "WrestleMania 33 against Roman Reigns",
      author: "BigDogFan",
      is_accepted: false,
      votes: 7
    }
  ],
  "wwe-q-8": [
    {
      id: "sol-8-1",
      question_id: "wwe-q-8",
      body: "Brock Lesnar, famously advocated by Paul Heyman.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 36
    },
    {
      id: "sol-8-2",
      question_id: "wwe-q-8",
      body: "Batista (The Animal)",
      author: "EvolutionFan",
      is_accepted: false,
      votes: 3
    }
  ],
  "wwe-q-9": [
    {
      id: "sol-9-1",
      question_id: "wwe-q-9",
      body: "The Walls of Jericho (elevated Boston Crab) and the Liontamer.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 17
    },
    {
      id: "sol-9-2",
      question_id: "wwe-q-9",
      body: "Codebreaker",
      author: "Y2JFan",
      is_accepted: false,
      votes: 2
    }
  ],
  "wwe-q-10": [
    {
      id: "sol-10-1",
      question_id: "wwe-q-10",
      body: "Triple H challenged The Undertaker at WrestleMania 28 with Shawn Michaels as the special guest referee in an 'End of an Era' match.",
      author: "AI Assistant (Automated)",
      is_accepted: true,
      votes: 30
    },
    {
      id: "sol-10-2",
      question_id: "wwe-q-10",
      body: "Edge",
      author: "RatedRFan",
      is_accepted: false,
      votes: 2
    }
  ]
};
