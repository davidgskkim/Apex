type RankStandards = {
  Bronze: number;
  Silver: number;
  Gold: number;
  Platinum: number;
  Diamond: number;
  Apex: number;
};

// Categories and their exercises
export const EXERCISE_LIST: Record<string, string[]> = {
  "Chest": [
    "Barbell Bench Press", 
    "Incline Bench Press", 
    "Dumbbell Press", 
    "Incline Dumbbell Press", 
    "Cable Flys", 
    "Dips",
    "Pushups"
  ],
  "Back": [
    "Deadlift", 
    "Pull Ups", 
    "Chin Ups",
    "Barbell Row", 
    "Lat Pulldowns", 
    "Seated Cable Row",
    "T-Bar Row",
    "Single Arm Dumbbell Row"
  ],
  "Legs": [
    "Barbell Squat", 
    "Front Squat",
    "Leg Press", 
    "Romanian Deadlift (RDL)", 
    "Bulgarian Split Squat",
    "Leg Extensions",
    "Hamstring Curls",
    "Calf Raises"
  ],
  "Shoulders": [
    "Overhead Press (OHP)", 
    "Seated Dumbbell Press", 
    "Arnold Press",
    "Lateral Raises", 
    "Face Pulls",
    "Front Raises",
    "Rear Delt Flys"
  ],
  "Biceps": [
    "Barbell Curl", 
    "Dumbbell Curl", 
    "Hammer Curl", 
    "Preacher Curl",
    "Concentration Curl",
    "Cable Curl"
  ],
  "Triceps": [
    "Tricep Pushdown", 
    "Skullcrushers", 
    "Overhead Extension", 
    "Close Grip Bench Press",
    "Kickbacks"
  ],
  "Abs": [
    "Crunches",
    "Leg Raises",
    "Plank",
    "Cable Crunch",
    "Ab Wheel"
  ]
};

// Strength standards in kg for each exercise and rank based on research
export const STRENGTH_STANDARDS: Record<string, RankStandards> = {
  // CHEST 
  "Barbell Bench Press": { Bronze: 60, Silver: 80, Gold: 90, Platinum: 100, Diamond: 140, Apex: 160 },
  "Incline Bench Press": { Bronze: 50, Silver: 70, Gold: 80, Platinum: 90, Diamond: 120, Apex: 140 },
  "Dumbbell Press": { Bronze: 20, Silver: 30, Gold: 36, Platinum: 42, Diamond: 50, Apex: 60 }, // Per hand
  "Incline Dumbbell Press": { Bronze: 18, Silver: 28, Gold: 34, Platinum: 40, Diamond: 48, Apex: 58 },
  "Cable Flys": { Bronze: 10, Silver: 15, Gold: 20, Platinum: 25, Diamond: 35, Apex: 45 },
  "Dips": { Bronze: 0, Silver: 10, Gold: 20, Platinum: 40, Diamond: 60, Apex: 80 }, // Added weight
  "Pushups": { Bronze: 0, Silver: 10, Gold: 20, Platinum: 30, Diamond: 50, Apex: 70 }, // Added weight

  // BACK
  "Deadlift": { Bronze: 100, Silver: 140, Gold: 160, Platinum: 180, Diamond: 220, Apex: 260 },
  "Pull Ups": { Bronze: 0, Silver: 5, Gold: 15, Platinum: 30, Diamond: 50, Apex: 70 }, // Added weight
  "Chin Ups": { Bronze: 0, Silver: 5, Gold: 20, Platinum: 35, Diamond: 55, Apex: 75 }, // Added weight
  "Barbell Row": { Bronze: 50, Silver: 70, Gold: 90, Platinum: 100, Diamond: 130, Apex: 150 },
  "Lat Pulldowns": { Bronze: 40, Silver: 60, Gold: 80, Platinum: 100, Diamond: 120, Apex: 140 },
  "Seated Cable Row": { Bronze: 40, Silver: 60, Gold: 80, Platinum: 100, Diamond: 120, Apex: 140 },
  "T-Bar Row": { Bronze: 40, Silver: 60, Gold: 80, Platinum: 100, Diamond: 125, Apex: 150 },
  "Single Arm Dumbbell Row": { Bronze: 20, Silver: 30, Gold: 40, Platinum: 50, Diamond: 70, Apex: 90 },

  // LEGS 
  "Barbell Squat": { Bronze: 60, Silver: 100, Gold: 120, Platinum: 140, Diamond: 180, Apex: 220 },
  "Front Squat": { Bronze: 40, Silver: 70, Gold: 90, Platinum: 110, Diamond: 140, Apex: 170 },
  "Leg Press": { Bronze: 150, Silver: 250, Gold: 350, Platinum: 450, Diamond: 550, Apex: 650 },
  "Romanian Deadlift (RDL)": { Bronze: 60, Silver: 100, Gold: 130, Platinum: 150, Diamond: 180, Apex: 220 },
  "Bulgarian Split Squat": { Bronze: 10, Silver: 20, Gold: 30, Platinum: 40, Diamond: 55, Apex: 70 }, // Per hand
  "Leg Extensions": { Bronze: 30, Silver: 50, Gold: 70, Platinum: 90, Diamond: 110, Apex: 140 },
  "Hamstring Curls": { Bronze: 30, Silver: 50, Gold: 70, Platinum: 90, Diamond: 110, Apex: 130 },
  "Calf Raises": { Bronze: 60, Silver: 100, Gold: 140, Platinum: 180, Diamond: 220, Apex: 260 },

  //SHOULDERS 
  "Overhead Press (OHP)": { Bronze: 30, Silver: 40, Gold: 50, Platinum: 60,  Diamond: 80, Apex: 100 },
  "Seated Dumbbell Press": { Bronze: 14, Silver: 22, Gold: 30, Platinum: 36, Diamond: 46, Apex: 56 }, // Per hand
  "Arnold Press": { Bronze: 12, Silver: 20, Gold: 28, Platinum: 34, Diamond: 44, Apex: 54 },
  "Lateral Raises": { Bronze: 6, Silver: 10, Gold: 14, Platinum: 18, Diamond: 24, Apex: 30 }, // Per hand
  "Face Pulls": { Bronze: 10, Silver: 20, Gold: 30, Platinum: 40, Diamond: 50, Apex: 60 },
  "Front Raises": { Bronze: 8, Silver: 12, Gold: 16, Platinum: 20, Diamond: 26, Apex: 32 },
  "Rear Delt Flys": { Bronze: 6, Silver: 10, Gold: 14, Platinum: 18, Diamond: 24, Apex: 30 },

  // --- BICEPS ---
  "Barbell Curl": { Bronze: 20, Silver: 30, Gold: 40, Platinum: 50, Diamond: 60, Apex: 75 },
  "Dumbbell Curl": { Bronze: 10, Silver: 14, Gold: 18, Platinum: 22, Diamond: 30, Apex: 38 }, // Per hand
  "Hammer Curl": { Bronze: 10, Silver: 16, Gold: 20, Platinum: 24, Diamond: 32, Apex: 42 },
  "Preacher Curl": { Bronze: 20, Silver: 30, Gold: 40, Platinum: 50, Diamond: 60, Apex: 70 },
  "Concentration Curl": { Bronze: 10, Silver: 14, Gold: 18, Platinum: 22, Diamond: 28, Apex: 36 },
  "Cable Curl": { Bronze: 20, Silver: 30, Gold: 40, Platinum: 50, Diamond: 65, Apex: 80 },

  // --- TRICEPS ---
  "Tricep Pushdown": { Bronze: 20, Silver: 35, Gold: 50, Platinum: 65, Diamond: 80, Apex: 100 },
  "Skullcrushers": { Bronze: 20, Silver: 30, Gold: 40, Platinum: 50, Diamond: 65, Apex: 80 },
  "Overhead Extension": { Bronze: 10, Silver: 16, Gold: 24, Platinum: 32, Diamond: 40, Apex: 50 }, // DB
  "Close Grip Bench Press": { Bronze: 40, Silver: 60, Gold: 80, Platinum: 100, Diamond: 120, Apex: 140 },
  "Kickbacks": { Bronze: 6, Silver: 10, Gold: 14, Platinum: 18, Diamond: 24, Apex: 30 },

  // --- ABS ---
  "Cable Crunch": { Bronze: 30, Silver: 50, Gold: 70, Platinum: 90, Diamond: 110, Apex: 130 },
};

export const RANK_DESCRIPTIONS: Record<string, string> = {
  "Bronze": "Beginner (Top 90%)",
  "Silver": "Novice (Top 60%)",
  "Gold": "Intermediate (Top 35%)",
  "Platinum": "Advanced (Top 10-15%)",
  "Diamond": "Elite (Top 1-2%)",
  "Apex": "World Class (Top 0.1%)"
};

export const getRank = (exerciseName: string | undefined, weight: number): string | null => {
  if (!exerciseName) return null;
  
  const standards = STRENGTH_STANDARDS[exerciseName];
  if (!standards) return null;

  if (weight >= standards.Apex) return "Apex";
  if (weight >= standards.Diamond) return "Diamond";
  if (weight >= standards.Platinum) return "Platinum";
  if (weight >= standards.Gold) return "Gold";
  if (weight >= standards.Silver) return "Silver";
  if (weight >= standards.Bronze) return "Bronze";
  return "Unranked";
};