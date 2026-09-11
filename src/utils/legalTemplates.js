/**
 * Standard Political Campaign Legal Boilerplates (SRS Sec 49 & 70)
 * Generates ECI-compliant, transparent in-app Privacy Policy & Terms of Service
 */

export function generateStandardPrivacyPolicy(clientName) {
  const name = clientName || 'the Campaign';
  const year = new Date().getFullYear();
  return `# Privacy Policy for ${name} Citizen Engagement Platform

Effective Date: January 1, ${year} | Last Updated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

1. INTRODUCTION & SCOPE
This official Privacy Policy governs how ${name} ("we", "us", or "our") collects, processes, protects, and stores citizen and voter data when interacting with our mobile application, web portal, grievance redressal system, and volunteer services. We are dedicated to maintaining strict privacy standards and safeguarding public trust.

2. INFORMATION WE COLLECT
We collect minimal and necessary information required to facilitate civic communication:
• Personal Identifiers: Full name, mobile phone number, and optional email address.
• Civic & Electoral Demographics: State, District, Vidhan Sabha constituency, Block, Gram Panchayat or Ward.
• Grievances & Community Requests: Issues, photos, descriptions, and location markers submitted for public development works.
• Democratic Engagement Metrics: Participation in public polls, volunteer events, feedback surveys, and party membership forms.

3. PURPOSE OF DATA USAGE
Your data is used strictly for legitimate democratic and community purposes:
• Delivering authentic constituency updates, government scheme notifications, and local development rally alerts.
• Tracking and resolving local civic complaints, sanitation, water, road, and electricity issues.
• Verifying legitimate voter community membership and managing grassroots volunteer tasks.
• WE DO NOT SELL, RENT, OR TRADE VOTER DATA WITH ANY COMMERCIAL THIRD-PARTY ADVERTISING COMPANIES.

4. DATA SECURITY & ENCRYPTION
All voter communications and sensitive personal records are transmitted using industry-standard SSL/TLS 256-bit encryption and stored securely in dedicated, role-based access controlled cloud databases.

5. ELECTION COMMISSION COMPLIANCE
This platform operates in strict compliance with the Model Code of Conduct and instructions issued by the Election Commission of India (ECI) regarding electronic campaign communications and ethical digital engagement.

6. CITIZEN RIGHTS & OPT-OUT
Citizens retain full rights to:
• Access their registered profile information at any time.
• Update incorrect details through the mobile app settings.
• Request account deletion or unsubscribe from broadcast messaging by contacting the campaign grievance officer.

7. CONTACT & GRIEVANCE OFFICER
For any privacy-related inquiries or data concerns, reach out to our authorized digital communication team via the in-app support desk.`;
}

export function generateStandardTerms(clientName) {
  const name = clientName || 'the Campaign';
  const year = new Date().getFullYear();
  return `# Terms and Conditions of Use — ${name} Platform

Effective Date: January 1, ${year} | Last Updated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

1. ACCEPTANCE OF TERMS
By downloading, registering, or accessing the ${name} Citizen Engagement Application or Web Portal ("Platform"), you agree to abide by these Terms and Conditions and all applicable local, state, and central laws.

2. CIVIC CODE OF CONDUCT
This platform is designed to promote constructive political dialogue, constituency welfare, and transparent leadership. Users agree NOT to:
• Post, upload, or circulate defamatory, obscene, sexually explicit, abusive, or hate speech targeting any caste, religion, gender, or community.
• Spread unsubstantiated rumors, deepfakes, manipulated media, or electoral misinformation.
• Attempt unauthorized access, security tampering, spamming, or reverse-engineering of the application.

3. VOLUNTEER & CAMPAIGN PARTICIPATION
• Participation in rallies, door-to-door campaigning, and digital volunteer activities is voluntary.
• Campaign banners, digital membership cards, and posters generated within the platform are licensed for personal civic support and authorized campaign promotion only.

4. GRIEVANCE REPORTING & RESOLUTION PROTOCOL
• All civic complaints, requests, and community queries submitted through the platform are forwarded to the leadership constituency team.
• While the team endeavors to resolve legitimate local issues promptly, submission of a grievance does not constitute a legal or statutory guarantee of government administrative action.

5. INTELLECTUAL PROPERTY & PARTY SYMBOLS
All logos, trademarks, official photographs of leaders, manifestos, and digital media published on this platform are the intellectual property of ${name} and protected under applicable copyright laws.

6. TERMINATION OF ACCESS
The platform administrators reserve the right to suspend, terminate, or restrict access to any account that violates these terms, participates in malicious trolling, or abuses platform resources.

7. DISPUTE RESOLUTION & JURISDICTION
Any legal claims or disputes arising in connection with the use of this platform shall be subject to the exclusive jurisdiction of the local courts within the constituency area.`;
}
