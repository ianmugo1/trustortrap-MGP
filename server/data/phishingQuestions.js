// Multiple choice questions for the phishing quiz.
// Loaded into MongoDB by seed/phishingQuestions.js.
const phishingQuestions = [
  {
    "text": "You receive a text saying: 'You've won a free iPhone! Click here to claim.' What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "sms",
    "options": [
      "Click the link to claim your prize",
      "Delete the message - this is a scam",
      "Reply with your address",
      "Forward it to friends"
    ],
    "correctOption": 1,
    "explanation": "You cannot win a contest you never entered. Free prizes out of nowhere are bait."
  },
  {
    "text": "Your bank emails you about suspicious activity and asks you to click a link. What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "Click the link immediately",
      "Reply with your account details",
      "Contact your bank directly using their official website",
      "Ignore all emails from banks"
    ],
    "correctOption": 2,
    "explanation": "Go to the bank's real site or app yourself. Never use the link in a worrying message."
  },
  {
    "text": "A friend messages you on Instagram: 'OMG look at this photo of you!' with a link. What's safest?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "social",
    "options": [
      "Tap the link to see the photo",
      "Ask your friend another way if they really sent it",
      "Log in on the page that opens",
      "Send the link to other friends"
    ],
    "correctOption": 1,
    "explanation": "Hacked accounts send this line to everyone. Check with your friend by phone or in person."
  },
  {
    "text": "An email says your Netflix payment failed and you must update your card within 24 hours. What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "Use the link in the email",
      "Open the Netflix app yourself and check your account",
      "Reply with your card number",
      "Do nothing ever again about Netflix emails"
    ],
    "correctOption": 1,
    "explanation": "If there is a real problem, you will see it in the app. The 24 hour deadline is there to rush you."
  },
  {
    "text": "You get an email from 'Amazon' but the sender address is amazon-support@gmail.com. What does this tell you?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "Amazon uses Gmail for support",
      "It is probably fake because a real company emails from its own domain",
      "It is safe because it says Amazon",
      "Gmail addresses are always safe"
    ],
    "correctOption": 1,
    "explanation": "Anyone can make a Gmail address with a company's name in it. Real Amazon emails end in amazon.com or a country version."
  },
  {
    "text": "A WhatsApp message from an unknown number claims to be family needing money urgently. What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "sms",
    "options": [
      "Send money immediately",
      "Call your actual family member to verify",
      "Ask for their bank details",
      "Share your bank details"
    ],
    "correctOption": 1,
    "explanation": "Ring the person on the number you already have. Scammers pretend to be family with a 'new phone'."
  },
  {
    "text": "A text from 'An Post' says a parcel is held and you must pay 1.99 to release it. You are not expecting a parcel. What now?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "sms",
    "options": [
      "Pay, it is only 1.99",
      "Ignore it and delete the text",
      "Reply STOP",
      "Tap the link to see which parcel"
    ],
    "correctOption": 1,
    "explanation": "Small fees are how scammers collect card details. No parcel expected means no fee owed."
  },
  {
    "text": "Which web address is the real PayPal site?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "web",
    "options": [
      "paypal.secure-login.com",
      "paypa1.com",
      "paypal.com",
      "paypal-account.help"
    ],
    "correctOption": 2,
    "explanation": "Read the part just before .com. Only paypal.com belongs to PayPal."
  },
  {
    "text": "An email has a button that says 'View invoice'. How can you check where it goes before clicking?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "email",
    "options": [
      "You cannot check",
      "Hover over it or long-press it to see the address",
      "Click it quickly and close it",
      "Forward it to a friend to click"
    ],
    "correctOption": 1,
    "explanation": "Hovering on a computer or long-pressing on a phone shows the real link."
  },
  {
    "text": "A message says 'Your account will be deleted TODAY unless you confirm your password.' Which trick is this?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "Urgency",
      "Kindness",
      "Humour",
      "Nothing, it is normal"
    ],
    "correctOption": 0,
    "explanation": "Deadlines make people act before they think. Real services do not delete accounts this way."
  },
  {
    "text": "Someone in a game chat offers free coins if you tell them your login. What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "gaming",
    "options": [
      "Share your login just once",
      "Say no, and report the player",
      "Give them a fake password to be funny",
      "Ask them to go first"
    ],
    "correctOption": 1,
    "explanation": "Nobody needs your login to give you something. Report and block."
  },
  {
    "text": "You get a call from 'Microsoft' saying your computer has a virus and they need remote access. What is the best move?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "phone",
    "options": [
      "Let them connect",
      "Hang up",
      "Read out what is on your screen",
      "Pay them to fix it"
    ],
    "correctOption": 1,
    "explanation": "Microsoft does not ring people about viruses. This is a well-known phone scam."
  },
  {
    "text": "An email from your school has an attachment called 'timetable.pdf.exe'. What should you notice?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "email",
    "options": [
      "Nothing",
      "It ends in .exe, so it is a program and not a document",
      "PDF files are dangerous",
      "It is too short"
    ],
    "correctOption": 1,
    "explanation": "The last ending is the real file type. A timetable would never be a program."
  },
  {
    "text": "A text has a link written as bit.ly/x7Yq2. Why should you be careful?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "sms",
    "options": [
      "Short links are always viruses",
      "A short link hides the real address",
      "It has numbers in it",
      "Texts cannot contain links"
    ],
    "correctOption": 1,
    "explanation": "You cannot see where a shortened link leads until you open it."
  },
  {
    "text": "You enter your password on a site and then notice the address is 'faceb00k-login.com'. What should you do first?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "web",
    "options": [
      "Nothing, you are logged in",
      "Change your Facebook password straight away on the real site",
      "Wait and see",
      "Tell nobody"
    ],
    "correctOption": 1,
    "explanation": "The fake site now has your password. Change it on the real site and turn on two-factor login."
  },
  {
    "text": "Which of these is the strongest sign an email is phishing?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "It has a logo",
      "It asks you to confirm your password or card details through a link",
      "It was sent in the morning",
      "It is short"
    ],
    "correctOption": 1,
    "explanation": "Real companies do not ask for passwords or card numbers by email."
  },
  {
    "text": "A QR code sticker on a parking meter asks you to pay through a website. What is the safest choice?",
    "isPhishing": true,
    "difficulty": "hard",
    "category": "web",
    "options": [
      "Scan and pay",
      "Use the official parking app or the meter itself",
      "Scan it and enter your card to test it",
      "Take the sticker home"
    ],
    "correctOption": 1,
    "explanation": "Scammers stick fake QR codes over real ones. Use the app you already trust."
  },
  {
    "text": "An email greets you as 'Dear valued customer' and says it is from your phone company. Why is that a clue?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "email",
    "options": [
      "Phone companies are rude",
      "A company you have an account with normally uses your name",
      "It is too polite",
      "It is not a clue"
    ],
    "correctOption": 1,
    "explanation": "Mass scam emails use vague greetings because the sender does not know who you are."
  },
  {
    "text": "You get a text with a 6-digit code you did not ask for, then a message from a 'friend' asking you to send it on. What is happening?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "sms",
    "options": [
      "Your friend needs help",
      "Someone is trying to get into your account and needs that code",
      "The app is broken",
      "It is a free gift"
    ],
    "correctOption": 1,
    "explanation": "The code is the last lock on your account. Never pass it on to anyone."
  },
  {
    "text": "A streamer's 'official giveaway' page asks you to log in with your game account to enter. What is the risk?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "gaming",
    "options": [
      "None",
      "The page can steal your username and password",
      "You might win too much",
      "Your game will update"
    ],
    "correctOption": 1,
    "explanation": "Only log in on the game's own site or app. Lookalike pages collect logins."
  },
  {
    "text": "An email from 'your teacher' asks you to buy gift cards and send photos of the codes. What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "email",
    "options": [
      "Buy them quickly",
      "Check with the teacher in person before doing anything",
      "Send only one code",
      "Reply asking how many"
    ],
    "correctOption": 1,
    "explanation": "Gift card requests by message are almost always scams. Check face to face."
  },
  {
    "text": "Which sender address is most likely real for a company called StreamBox?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "email",
    "options": [
      "support@streambox.com",
      "streambox@support-mail.net",
      "streambox.help@outlook.com",
      "admin@streamb0x.co"
    ],
    "correctOption": 0,
    "explanation": "The company name should be the last part before .com, spelled correctly."
  },
  {
    "text": "A pop-up on a website says 'Your phone is infected! Tap to clean now.' What should you do?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "web",
    "options": [
      "Tap to clean",
      "Close the tab without tapping the pop-up",
      "Enter your phone number",
      "Share the page"
    ],
    "correctOption": 1,
    "explanation": "Websites cannot scan your phone. The pop-up is an advert or a scam."
  },
  {
    "text": "An email looks perfect: right logo, your name, no spelling mistakes. It asks you to log in through a link. Is it safe?",
    "isPhishing": true,
    "difficulty": "hard",
    "category": "email",
    "options": [
      "Yes, good spelling means it is real",
      "Not for sure. Go to the site yourself instead of using the link",
      "Yes, it has your name",
      "Yes, logos cannot be copied"
    ],
    "correctOption": 1,
    "explanation": "AI tools let scammers write flawless messages. The safe habit is to never log in through an emailed link."
  },
  {
    "text": "Your friend sends a voice note asking to borrow money and to keep it secret. It sounds like them. What should you do?",
    "isPhishing": true,
    "difficulty": "hard",
    "category": "social",
    "options": [
      "Send the money",
      "Ring them or ask them in person first",
      "Send half",
      "Ask for their card number"
    ],
    "correctOption": 1,
    "explanation": "Voices can be copied by AI. A request for money and secrecy needs checking another way."
  },
  {
    "text": "A job advert offers 500 a week for 'liking videos' and asks for a 20 sign-up fee. What is this?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "social",
    "options": [
      "A great job",
      "A scam: real jobs do not charge you to start",
      "A government scheme",
      "A school project"
    ],
    "correctOption": 1,
    "explanation": "Paying to get paid is the giveaway. The fee is the whole point of the scam."
  },
  {
    "text": "You are on free cafe Wi-Fi and a page pops up asking for your email password 'to connect'. What should you do?",
    "isPhishing": true,
    "difficulty": "hard",
    "category": "web",
    "options": [
      "Type it in",
      "Close it. Wi-Fi does not need your email password",
      "Use your friend's password",
      "Try three times"
    ],
    "correctOption": 1,
    "explanation": "A Wi-Fi login never needs the password for your email or social accounts."
  },
  {
    "text": "An email says you have a tax refund and asks for your bank login to pay it in. Why is this wrong?",
    "isPhishing": true,
    "difficulty": "medium",
    "category": "email",
    "options": [
      "Refunds do not exist",
      "To pay you, nobody needs your login, only account details you give on the official site",
      "It was sent on a weekend",
      "Tax offices only use post"
    ],
    "correctOption": 1,
    "explanation": "A login lets someone take money out. Nobody needs it to put money in."
  },
  {
    "text": "The link text says www.mybank.ie but long-pressing it shows http://mybank.ie.login-check.ru. Which one is real?",
    "isPhishing": true,
    "difficulty": "hard",
    "category": "email",
    "options": [
      "The text you can see",
      "The address shown when you long-press",
      "Both",
      "Neither can be known"
    ],
    "correctOption": 1,
    "explanation": "Link text can say anything. The address underneath is where you would really go."
  },
  {
    "text": "You realise you clicked a phishing link five minutes ago. What is the best first step?",
    "isPhishing": true,
    "difficulty": "easy",
    "category": "general",
    "options": [
      "Hope for the best",
      "Tell a trusted adult and change the password for that account",
      "Delete the app",
      "Turn the screen off"
    ],
    "correctOption": 1,
    "explanation": "Acting fast limits the damage. Telling someone is never the wrong move."
  }
];

export default phishingQuestions;
