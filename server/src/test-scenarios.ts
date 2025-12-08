import OpenAI from 'openai';
import { db } from './db';
import { Identity, Email, Service, Project, Message } from './models';
import { IDENTITY_AGENT_SYSTEM_PROMPT } from './prompts/identityAgentSystemPrompt';

const openai = new OpenAI({
    apiKey: process.env.JARVIS_OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.JARVIS_OPENAI_API_KEY ? undefined : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});

interface TestScenario {
    id: string;
    set: string;
    name: string;
    query: string;
    expectedBehaviors: string[];
}

const testScenarios: TestScenario[] = [
    {
        id: '1A',
        set: 'Shared Account Confusion',
        name: 'One email, three identities using the service',
        query: 'Who uses the Midjourney account registered to finafeels@gmail.com? Who is the primary owner and who shares it?',
        expectedBehaviors: [
            'Primary identity: Fina',
            'Shared identities: Leila, Lara',
            'Should NOT duplicate the service',
            'Should recognize single service with multiple users'
        ]
    },
    {
        id: '1B',
        set: 'Shared Account Confusion',
        name: 'Single identity uses multiple services with different personas',
        query: 'Build an identity footprint for Fina. What AI creative services does she use? Are any shared with others?',
        expectedBehaviors: [
            'Should build identity footprint',
            'Should correlate multi-service behaviour',
            'Should identify shared vs solo usage patterns'
        ]
    },
    {
        id: '2A',
        set: 'Email Identity Ambiguity',
        name: 'Generic Gmail Account',
        query: 'Analyze the email creativehubproject@gmail.com. Who owns it? What services are connected to it?',
        expectedBehaviors: [
            'Should NOT assign to Fina/Leila/Lara unless confident',
            'Should suggest a Shared or Generic Creative identity',
            'Should flag ambiguity'
        ]
    },
    {
        id: '2B',
        set: 'Email Identity Ambiguity',
        name: 'Business email used by multiple personas',
        query: 'Analyze the studio@finafeels.com email. Is this a personal or business email? Who uses it?',
        expectedBehaviors: [
            'Should NOT force into Fina personal identity',
            'Should treat as business or shared identity',
            'Should classify as Organisation or Studio'
        ]
    },
    {
        id: '3A',
        set: 'Conflicting Ownership',
        name: 'Billing says Fina, email says Leila',
        query: 'Who owns the Stable Diffusion account? The login email is leila.creative@ but the invoice shows Fina Feels Ltd as the payer.',
        expectedBehaviors: [
            'Should pick Fina as financial owner',
            'Should note Leila manages the login',
            'Should create two-layer attribution: primary_owner and login_manager'
        ]
    },
    {
        id: '3B',
        set: 'Conflicting Ownership',
        name: 'Emails from two different names for same service',
        query: 'Who actually uses the Spotify account? I see promotional emails to Lara, but billing emails go to Fina.',
        expectedBehaviors: [
            'Should deduce Lara is the actual user',
            'Should identify Fina as the payer',
            'Service shared but primarily used by Lara'
        ]
    },
    {
        id: '4A',
        set: 'High-Value Financial',
        name: 'Pension statement',
        query: 'Find any pension-related emails. What action should I take?',
        expectedBehaviors: [
            'MUST flag has_high_value_financial: true',
            'MUST generate flag_financial_item command',
            'Should NOT misclassify as subscription'
        ]
    },
    {
        id: '4B',
        set: 'High-Value Financial',
        name: 'Trust fund notification',
        query: 'Are there any trust fund communications? What is the status?',
        expectedBehaviors: [
            'Highest importance flagging',
            'Financial category: trust_fund',
            'Should prompt user to review'
        ]
    },
    {
        id: '4C',
        set: 'High-Value Financial',
        name: 'Mixed content email (ISA promo with tax info)',
        query: 'Analyze the ISA marketing email. Is there any important financial content I should not ignore?',
        expectedBehaviors: [
            'Should identify financial content',
            'Should still classify as high-value despite marketing wrapper',
            'Should not drown it in marketing noise'
        ]
    },
    {
        id: '5A',
        set: 'Security Analysis',
        name: 'Login attempts from two places',
        query: 'I see login alerts from both London and Spain for Midjourney. Is this suspicious or expected?',
        expectedBehaviors: [
            'Should NOT assume a hack',
            'Should consider shared usage across identities',
            'Should explain multiple users may be logging in from different locations'
        ]
    },
    {
        id: '5B',
        set: 'Security Analysis',
        name: 'Password reset requested by unknown identity',
        query: 'There was a password reset for Cloudflare. I did not request it. What should I do?',
        expectedBehaviors: [
            'Should classify under security',
            'Should NOT classify under billing',
            'Should suggest checking shared identities who use the service'
        ]
    },
    {
        id: '6A',
        set: 'Ownership Drift',
        name: 'Service usage changed over time',
        query: 'Look at the Runway service. Who originally used it and who uses it now?',
        expectedBehaviors: [
            'Should detect early emails showed Fina',
            'Should detect later emails show Lara',
            'Should suggest ownership update'
        ]
    },
    {
        id: '7A',
        set: 'Identity Suggestions',
        name: 'New email appears for the first time',
        query: 'I see an email from newservice.ai to creativehubproject@gmail.com. Should I create a new identity for this?',
        expectedBehaviors: [
            'Should ask: Should I create an identity for this email address',
            'Should provide identity_suggestions'
        ]
    },
    {
        id: '7B',
        set: 'Identity Suggestions',
        name: 'Multiple services but no identity',
        query: 'The generic creative email has Adobe and Netflix connected but no clear owner. What should I do?',
        expectedBehaviors: [
            'Should propose creating new identity',
            'Should ask user to name it'
        ]
    }
];

async function runScenarioTest(scenario: TestScenario): Promise<{
    scenario: TestScenario;
    response: any;
    analysis: {
        passedBehaviors: string[];
        failedBehaviors: string[];
        suggestions: string[];
    };
}> {
    console.log('\n' + '='.repeat(80));
    console.log('Testing Scenario ' + scenario.id + ': ' + scenario.name);
    console.log('Set: ' + scenario.set);
    console.log('Query: ' + scenario.query);
    console.log('='.repeat(80));

    const [identities, emails, services, projects, messages] = await Promise.all([
        db.collection<Identity>('identities').find(),
        db.collection<Email>('emails').find(),
        db.collection<Service>('services').find(),
        db.collection<Project>('projects').find(),
        db.collection<Message>('messages').find()
    ]);

    const context = { identities, emails, services, projects, messages };
    const finalPrompt = IDENTITY_AGENT_SYSTEM_PROMPT + '\n\nData Context:\n' + JSON.stringify(context, null, 2);

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: finalPrompt },
                { role: 'user', content: scenario.query }
            ],
            model: 'gpt-5.1',
            response_format: { type: 'json_object' },
            max_completion_tokens: 4096
        });

        const content = completion.choices[0].message.content;
        let response: any = {};

        try {
            if (content) {
                response = JSON.parse(content);
            }
        } catch (e) {
            response = { answer: content, parseError: true };
        }

        console.log('\nAI Response:');
        console.log(JSON.stringify(response, null, 2));

        const passedBehaviors: string[] = [];
        const failedBehaviors: string[] = [];
        const suggestions: string[] = [];

        const responseStr = JSON.stringify(response).toLowerCase();
        const answer = (response.answer || '').toLowerCase();

        for (const behavior of scenario.expectedBehaviors) {
            const behaviorLower = behavior.toLowerCase();
            let passed = false;

            if (behaviorLower.includes('has_high_value_financial: true')) {
                passed = response.has_high_value_financial === true;
            } else if (behaviorLower.includes('flag_financial_item')) {
                passed = response.commands?.some((c: any) => c.action === 'flag_financial_item');
            } else if (behaviorLower.includes('should not assume a hack')) {
                passed = !answer.includes('hack') && !answer.includes('breach') && !answer.includes('compromised');
            } else if (behaviorLower.includes('identity_suggestions')) {
                passed = response.identity_suggestions?.length > 0;
            } else if (behaviorLower.includes('detected_ambiguities') || behaviorLower.includes('flag ambiguity')) {
                passed = response.detected_ambiguities?.length > 0 || answer.includes('ambig') || answer.includes('unclear');
            } else {
                const keyPhrases = behavior.split(' ').filter(w => w.length > 4);
                passed = keyPhrases.some(phrase => responseStr.includes(phrase.toLowerCase()));
            }

            if (passed) {
                passedBehaviors.push(behavior);
            } else {
                failedBehaviors.push(behavior);
            }
        }

        if (failedBehaviors.length > 0) {
            suggestions.push('Consider enhancing prompt to handle: ' + failedBehaviors.join(', '));
        }

        console.log('\n--- Analysis ---');
        console.log('Passed: ' + passedBehaviors.length + '/' + scenario.expectedBehaviors.length);
        if (passedBehaviors.length > 0) console.log('  ✓ ' + passedBehaviors.join('\n  ✓ '));
        if (failedBehaviors.length > 0) console.log('  ✗ ' + failedBehaviors.join('\n  ✗ '));

        return {
            scenario,
            response,
            analysis: { passedBehaviors, failedBehaviors, suggestions }
        };

    } catch (error: any) {
        console.error('Error running scenario:', error.message);
        return {
            scenario,
            response: { error: error.message },
            analysis: {
                passedBehaviors: [],
                failedBehaviors: scenario.expectedBehaviors,
                suggestions: ['API error - check OpenAI connection']
            }
        };
    }
}

async function runAllTests() {
    console.log('\n' + '═'.repeat(80));
    console.log('JARVIS IDENTITY HUB - AI SCENARIO TEST SUITE');
    console.log('═'.repeat(80));
    console.log('Running ' + testScenarios.length + ' scenarios...\n');

    const results: any[] = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const scenario of testScenarios) {
        const result = await runScenarioTest(scenario);
        results.push(result);
        totalPassed += result.analysis.passedBehaviors.length;
        totalFailed += result.analysis.failedBehaviors.length;

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '═'.repeat(80));
    console.log('TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log('Total Behaviors Tested: ' + (totalPassed + totalFailed));
    console.log('Passed: ' + totalPassed);
    console.log('Failed: ' + totalFailed);
    console.log('Pass Rate: ' + ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) + '%');

    console.log('\n--- Failed Behaviors by Scenario ---');
    for (const result of results) {
        if (result.analysis.failedBehaviors.length > 0) {
            console.log('\n' + result.scenario.id + ' - ' + result.scenario.name + ':');
            result.analysis.failedBehaviors.forEach((b: string) => console.log('  ✗ ' + b));
        }
    }

    console.log('\n--- Improvement Suggestions ---');
    const allSuggestions = results.flatMap(r => r.analysis.suggestions);
    [...new Set(allSuggestions)].forEach(s => console.log('• ' + s));

    return results;
}

runAllTests().then(() => {
    console.log('\nTest suite completed.');
    process.exit(0);
}).catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
