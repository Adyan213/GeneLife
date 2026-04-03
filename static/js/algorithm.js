// Health Recommendation Algorithm
class HealthAnalyzer {
    constructor() {
        this.categoryThresholds = {
            cardiovascular: { low: 15, moderate: 25, high: 35 },
            metabolic: { low: 15, moderate: 25, high: 35 },
            lifestyle: { low: 15, moderate: 25, high: 35 },
            mental: { low: 2, moderate: 4, high: 7 },
            cancer: { low: 2, moderate: 4, high: 7 },
            respiratory: { low: 2, moderate: 4, high: 7 }
        };
    }

    // Calculate risk scores for each health category
    calculateRiskScores(answers) {
        const categoryScores = {
            cardiovascular: 0,
            metabolic: 0,
            lifestyle: 0,
            mental: 0,
            cancer: 0,
            respiratory: 0
        };

        // Sum up scores from all answers
        answers.forEach(answer => {
            const scores = answer.option.scores;
            for (let category in scores) {
                if (categoryScores.hasOwnProperty(category)) {
                    categoryScores[category] += scores[category];
                }
            }
        });

        // Determine risk level for each category
        const riskLevels = {};
        for (let category in categoryScores) {
            const score = categoryScores[category];
            const thresholds = this.categoryThresholds[category];
            
            if (score <= thresholds.low) {
                riskLevels[category] = { level: 'low', score: score, percentage: (score / thresholds.high) * 100 };
            } else if (score <= thresholds.moderate) {
                riskLevels[category] = { level: 'moderate', score: score, percentage: (score / thresholds.high) * 100 };
            } else {
                riskLevels[category] = { level: 'high', score: score, percentage: Math.min((score / thresholds.high) * 100, 100) };
            }
        }

        return riskLevels;
    }

    // Generate personalized recommendations based on risk scores
    generateRecommendations(riskLevels, answers) {
        const recommendations = [];

        // Cardiovascular recommendations
        if (riskLevels.cardiovascular.level === 'high' || riskLevels.cardiovascular.level === 'moderate') {
            recommendations.push({
                category: 'Cardiovascular Health',
                icon: '❤️',
                priority: riskLevels.cardiovascular.level,
                title: 'Heart Health Priority',
                advice: 'Your cardiovascular risk factors suggest increased attention to heart health. Consider incorporating 30 minutes of moderate aerobic exercise (walking, swimming, cycling) at least 5 days per week. Reduce sodium intake to less than 2,300mg per day and focus on heart-healthy fats from sources like olive oil, nuts, and fish. Schedule regular blood pressure and cholesterol screenings.'
            });
        }

        // Metabolic recommendations
        if (riskLevels.metabolic.level === 'high' || riskLevels.metabolic.level === 'moderate') {
            recommendations.push({
                category: 'Metabolic Health',
                icon: '🔬',
                priority: riskLevels.metabolic.level,
                title: 'Blood Sugar Management',
                advice: 'Focus on maintaining healthy blood sugar levels through balanced meals. Emphasize complex carbohydrates (whole grains, legumes) over refined sugars. Include lean proteins and healthy fats with each meal to stabilize blood sugar. Consider intermittent fasting (consult your doctor first) and get your HbA1c levels checked annually. Maintain a healthy weight through consistent portion control.'
            });
        }

        // Lifestyle recommendations
        if (riskLevels.lifestyle.level === 'high' || riskLevels.lifestyle.level === 'moderate') {
            recommendations.push({
                category: 'Lifestyle Optimization',
                icon: '🏃',
                priority: riskLevels.lifestyle.level,
                title: 'Daily Habits Enhancement',
                advice: 'Establish consistent sleep schedule aiming for 7-9 hours nightly. Create a bedtime routine: dim lights 2 hours before sleep, avoid screens 1 hour before bed, keep bedroom cool (65-68°F). Implement stress-reduction techniques such as 10-minute daily meditation, deep breathing exercises, or yoga. Stay hydrated with 8-10 glasses of water daily. Limit processed foods and prioritize whole foods in your diet.'
            });
        }

        // Mental health recommendations
        if (riskLevels.mental.level === 'high' || riskLevels.mental.level === 'moderate') {
            recommendations.push({
                category: 'Mental Wellness',
                icon: '🧠',
                priority: riskLevels.mental.level,
                title: 'Stress Management',
                advice: 'High stress levels can impact overall health. Consider working with a mental health professional for stress management strategies. Practice mindfulness meditation for 10-15 minutes daily. Engage in regular physical activity, which naturally reduces stress hormones. Maintain social connections and don\'t hesitate to reach out for support. Set boundaries at work and prioritize self-care activities. Consider journaling to process emotions.'
            });
        }

        // Cancer prevention recommendations
        if (riskLevels.cancer.level === 'high' || riskLevels.cancer.level === 'moderate') {
            recommendations.push({
                category: 'Cancer Prevention',
                icon: '🛡️',
                priority: riskLevels.cancer.level,
                title: 'Preventive Screening',
                advice: 'Given your family history, discuss appropriate cancer screening schedules with your doctor. This may include colonoscopy, mammography, or other screenings starting earlier than standard recommendations. Maintain a diet rich in cruciferous vegetables (broccoli, cauliflower, kale), berries, and tomatoes. Limit processed meats and maintain healthy weight. Avoid tobacco and limit alcohol consumption. Stay physically active and protect skin from excessive sun exposure.'
            });
        }

        // Respiratory recommendations
        if (riskLevels.respiratory.level === 'high' || riskLevels.respiratory.level === 'moderate') {
            recommendations.push({
                category: 'Respiratory Health',
                icon: '🫁',
                priority: riskLevels.respiratory.level,
                title: 'Lung Health Priority',
                advice: 'If you currently smoke, quitting is the single most important step for your health. Consider nicotine replacement therapy or medications under doctor supervision. Avoid secondhand smoke and air pollution when possible. Exercise regularly to improve lung capacity. Practice deep breathing exercises daily. Ensure adequate indoor air quality and consider an air purifier. Get annual flu vaccines and discuss pneumonia vaccine with your doctor.'
            });
        }

        // Add at least one general wellness recommendation
        if (recommendations.length < 3) {
            recommendations.push({
                category: 'General Wellness',
                icon: '⭐',
                priority: 'low',
                title: 'Overall Health Maintenance',
                advice: 'Continue your healthy lifestyle practices. Focus on balanced nutrition with plenty of fruits, vegetables, whole grains, and lean proteins. Stay physically active with a mix of cardio, strength training, and flexibility exercises. Maintain social connections and engage in activities that bring you joy. Practice good sleep hygiene and stress management. Stay current with preventive health screenings appropriate for your age and risk factors.'
            });
        }

        // Sort recommendations by priority
        const priorityOrder = { high: 0, moderate: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations;
    }

    // Generate detailed analysis for each category
    generateCategoryDetails(riskLevels, answers) {
        const details = {
            cardiovascular: this.getCardiovascularDetails(riskLevels.cardiovascular, answers),
            metabolic: this.getMetabolicDetails(riskLevels.metabolic, answers),
            lifestyle: this.getLifestyleDetails(riskLevels.lifestyle, answers)
        };

        return details;
    }

    getCardiovascularDetails(risk, answers) {
        const exerciseAnswer = answers.find(a => a.questionId === 3);
        const familyHistory = answers.find(a => a.questionId === 7);
        const smoking = answers.find(a => a.questionId === 5);

        let analysis = `Your cardiovascular risk is currently ${risk.level}. `;
        
        if (risk.level === 'high') {
            analysis += 'This indicates several risk factors that need attention. ';
        } else if (risk.level === 'moderate') {
            analysis += 'While not critical, there are areas for improvement. ';
        } else {
            analysis += 'You\'re doing well in this area. ';
        }

        const tips = [];
        
        if (exerciseAnswer && (exerciseAnswer.option.value === 'sedentary' || exerciseAnswer.option.value === 'moderate')) {
            tips.push('Increase physical activity to 150 minutes of moderate exercise per week');
        }
        
        if (familyHistory && familyHistory.option.value !== 'no') {
            tips.push('Regular cardiac screenings are especially important given your family history');
        }
        
        if (smoking && smoking.option.value !== 'never') {
            tips.push('Smoking cessation is critical for heart health');
        }

        tips.push('Monitor blood pressure and cholesterol levels regularly');
        tips.push('Adopt a heart-healthy diet (Mediterranean or DASH diet)');

        return { analysis, tips };
    }

    getMetabolicDetails(risk, answers) {
        const diet = answers.find(a => a.questionId === 2);
        const weight = answers.find(a => a.questionId === 11);
        const familyHistory = answers.find(a => a.questionId === 8);

        let analysis = `Your metabolic health status is ${risk.level}. `;
        
        if (risk.level === 'high') {
            analysis += 'This suggests increased risk for diabetes and metabolic syndrome. ';
        } else if (risk.level === 'moderate') {
            analysis += 'Some lifestyle modifications could improve your metabolic health. ';
        } else {
            analysis += 'Your metabolic health appears good. ';
        }

        const tips = [];
        
        if (diet && (diet.option.value === 'processed' || diet.option.value === 'mixed')) {
            tips.push('Transition to whole foods and reduce processed food intake');
        }
        
        if (weight && weight.option.value !== 'healthy') {
            tips.push('Work towards achieving a healthy weight through balanced diet and exercise');
        }
        
        if (familyHistory && familyHistory.option.value !== 'no') {
            tips.push('Annual HbA1c and fasting glucose tests are recommended');
        }

        tips.push('Focus on low-glycemic index foods to stabilize blood sugar');
        tips.push('Include regular physical activity to improve insulin sensitivity');

        return { analysis, tips };
    }

    getLifestyleDetails(risk, answers) {
        const sleep = answers.find(a => a.questionId === 4);
        const stress = answers.find(a => a.questionId === 6);
        const alcohol = answers.find(a => a.questionId === 10);

        let analysis = `Your lifestyle factors indicate ${risk.level} risk level. `;
        
        if (risk.level === 'high') {
            analysis += 'Several lifestyle changes could significantly improve your overall health. ';
        } else if (risk.level === 'moderate') {
            analysis += 'Small adjustments to daily habits can make a big difference. ';
        } else {
            analysis += 'You\'re maintaining healthy lifestyle habits. ';
        }

        const tips = [];
        
        if (sleep && sleep.option.value !== 'optimal') {
            tips.push('Prioritize 7-9 hours of quality sleep each night');
        }
        
        if (stress && (stress.option.value === 'high' || stress.option.value === 'very-high')) {
            tips.push('Implement daily stress-reduction techniques (meditation, yoga, deep breathing)');
        }
        
        if (alcohol && (alcohol.option.value === 'moderate' || alcohol.option.value === 'heavy')) {
            tips.push('Consider reducing alcohol consumption to moderate levels');
        }

        tips.push('Maintain consistent daily routines for meals and sleep');
        tips.push('Spend time outdoors and in nature regularly');

        return { analysis, tips };
    }

    getPreventionDetails(risk, answers) {
        const checkups = answers.find(a => a.questionId === 12);
        const age = answers.find(a => a.questionId === 1);

        let analysis = `Your preventive care engagement is ${risk.level}. `;
        
        if (risk.level === 'high') {
            analysis += 'Regular health screenings are crucial for early detection and prevention. ';
        } else if (risk.level === 'moderate') {
            analysis += 'Increasing your engagement with preventive care would be beneficial. ';
        } else {
            analysis += 'You\'re proactive about preventive health. ';
        }

        const tips = [];
        
        if (checkups && checkups.option.value !== 'annual') {
            tips.push('Schedule annual comprehensive physical examinations');
        }
        
        tips.push('Keep all vaccinations up to date');
        tips.push('Discuss age-appropriate cancer screenings with your doctor');
        tips.push('Track your family health history and share with healthcare providers');
        tips.push('Maintain a personal health record of all medical visits and test results');

        return { analysis, tips };
    }
}

// Create global instance
const healthAnalyzer = new HealthAnalyzer();
