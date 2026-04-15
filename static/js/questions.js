// All quiz questions with scoring weights for different health categories
const questions = [
    {
        id: 1,
        question: "What is your age group?",
        options: [
            { text: "18-25 years", value: "18-25", scores: { cardiovascular: 1, metabolic: 1, lifestyle: 1 } },
            { text: "26-35 years", value: "26-35", scores: { cardiovascular: 2, metabolic: 2, lifestyle: 2 } },
            { text: "36-45 years", value: "36-45", scores: { cardiovascular: 3, metabolic: 3, lifestyle: 3 } },
            { text: "46-55 years", value: "46-55", scores: { cardiovascular: 4, metabolic: 4, lifestyle: 4 } },
            { text: "56+ years", value: "56+", scores: { cardiovascular: 5, metabolic: 5, lifestyle: 5 } }
        ]
    },
    {
        id: 2,
        question: "How would you describe your current diet?",
        options: [
            { text: "Balanced with lots of fruits and vegetables", value: "balanced", scores: { metabolic: 1, cardiovascular: 1, lifestyle: 1 } },
            { text: "Mostly healthy with occasional treats", value: "mostly-healthy", scores: { metabolic: 2, cardiovascular: 2, lifestyle: 2 } },
            { text: "Mixed - some healthy, some processed foods", value: "mixed", scores: { metabolic: 4, cardiovascular: 3, lifestyle: 3 } },
            { text: "Mostly processed or fast foods", value: "processed", scores: { metabolic: 6, cardiovascular: 5, lifestyle: 5 } }
        ]
    },
    {
        id: 3,
        question: "How often do you exercise per week?",
        options: [
            { text: "5+ times per week", value: "very-active", scores: { cardiovascular: 1, metabolic: 1, lifestyle: 1 } },
            { text: "3-4 times per week", value: "active", scores: { cardiovascular: 2, metabolic: 2, lifestyle: 2 } },
            { text: "1-2 times per week", value: "moderate", scores: { cardiovascular: 4, metabolic: 3, lifestyle: 3 } },
            { text: "Rarely or never", value: "sedentary", scores: { cardiovascular: 6, metabolic: 5, lifestyle: 6 } }
        ]
    },
    {
        id: 4,
        question: "How many hours of sleep do you typically get per night?",
        options: [
            { text: "7-9 hours", value: "optimal", scores: { lifestyle: 1, metabolic: 1 } },
            { text: "6-7 hours", value: "adequate", scores: { lifestyle: 2, metabolic: 2 } },
            { text: "5-6 hours", value: "insufficient", scores: { lifestyle: 4, metabolic: 4 } },
            { text: "Less than 5 hours", value: "very-insufficient", scores: { lifestyle: 6, metabolic: 5, cardiovascular: 3 } }
        ]
    },
    {
        id: 5,
        question: "Do you smoke or use tobacco products?",
        options: [
            { text: "Never", value: "never", scores: { cardiovascular: 1, respiratory: 1 } },
            { text: "Former smoker (quit over 1 year ago)", value: "former", scores: { cardiovascular: 3, respiratory: 3 } },
            { text: "Occasional smoker", value: "occasional", scores: { cardiovascular: 5, respiratory: 5 } },
            { text: "Daily smoker", value: "daily", scores: { cardiovascular: 7, respiratory: 7 } }
        ]
    },
    {
        id: 6,
        question: "How would you rate your stress levels?",
        options: [
            { text: "Low - I manage stress well", value: "low", scores: { lifestyle: 1, mental: 1, cardiovascular: 1 } },
            { text: "Moderate - Some stressful periods", value: "moderate", scores: { lifestyle: 3, mental: 3, cardiovascular: 2 } },
            { text: "High - Often stressed", value: "high", scores: { lifestyle: 5, mental: 5, cardiovascular: 4 } },
            { text: "Very high - Constantly overwhelmed", value: "very-high", scores: { lifestyle: 7, mental: 7, cardiovascular: 5 } }
        ]
    },
    {
        id: 7,
        question: "Does your family have a history of heart disease?",
        options: [
            { text: "No family history", value: "no", scores: { cardiovascular: 1 } },
            { text: "Distant relatives (grandparents, aunts, uncles)", value: "distant", scores: { cardiovascular: 3 } },
            { text: "Immediate family (parents, siblings)", value: "immediate", scores: { cardiovascular: 6 } },
            { text: "Multiple family members affected", value: "multiple", scores: { cardiovascular: 8 } }
        ]
    },
    {
        id: 8,
        question: "Does your family have a history of diabetes?",
        options: [
            { text: "No family history", value: "no", scores: { metabolic: 1 } },
            { text: "Distant relatives (grandparents, aunts, uncles)", value: "distant", scores: { metabolic: 3 } },
            { text: "Immediate family (parents, siblings)", value: "immediate", scores: { metabolic: 6 } },
            { text: "Multiple family members affected", value: "multiple", scores: { metabolic: 8 } }
        ]
    },
    {
        id: 9,
        question: "Does your family have a history of cancer?",
        options: [
            { text: "No family history", value: "no", scores: { cancer: 1 } },
            { text: "Distant relatives", value: "distant", scores: { cancer: 3 } },
            { text: "Immediate family", value: "immediate", scores: { cancer: 5 } },
            { text: "Multiple family members with early onset", value: "multiple", scores: { cancer: 7 } }
        ]
    },
    {
        id: 10,
        question: "How often do you consume alcohol?",
        options: [
            { text: "Never or rarely", value: "rarely", scores: { lifestyle: 1, metabolic: 1 } },
            { text: "1-2 drinks per week", value: "light", scores: { lifestyle: 2, metabolic: 1 } },
            { text: "3-7 drinks per week", value: "moderate", scores: { lifestyle: 4, metabolic: 3 } },
            { text: "8+ drinks per week", value: "heavy", scores: { lifestyle: 6, metabolic: 5, cardiovascular: 3 } }
        ]
    },
    {
        id: 11,
        question: "What is your current body weight status?",
        options: [
            { text: "Healthy weight range", value: "healthy", scores: { metabolic: 1, cardiovascular: 1 } },
            { text: "Slightly overweight", value: "overweight", scores: { metabolic: 3, cardiovascular: 3 } },
            { text: "Significantly overweight", value: "obese", scores: { metabolic: 5, cardiovascular: 5 } },
            { text: "Underweight", value: "underweight", scores: { metabolic: 3, lifestyle: 3 } }
        ]
    },
    {
        id: 12,
        question: "How often do you have regular health check-ups?",
        options: [
            { text: "Annually", value: "annual", scores: { cardiovascular: 1, metabolic: 1 } },
            { text: "Every 2-3 years", value: "occasional", scores: { cardiovascular: 2, metabolic: 2 } },
            { text: "Only when feeling unwell", value: "reactive", scores: { cardiovascular: 3, metabolic: 3 } },
            { text: "Rarely or never", value: "never", scores: { cardiovascular: 4, metabolic: 4 } }
        ]
    }
];
