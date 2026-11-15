const cyberPetMiniGames = {
  // =====================
  // TRUE / FALSE
  // answer: boolean (true or false)
  // =====================
  trueFalse: {
    label: "True or False",
    dailyCount: 7,
    reward: {
      correct: { riskDelta: -6, moodDelta: 3, healthDelta: 2 },
      incorrect: { riskDelta: 4, moodDelta: -3, healthDelta: -2 },
    },
    questions: [
      {
        id: "tf_01",
        prompt: "Using the same password across sites is safe if the password is long.",
        answer: false,
        explanation: "Password reuse is risky because one breach can expose all accounts sharing that password.",
      },
      {
        id: "tf_02",
        prompt: "Enabling 2FA can reduce the impact of leaked passwords.",
        answer: true,
        explanation: "2FA adds a second verification step, making account takeover harder.",
      },
      {
        id: "tf_03",
        prompt: "A short password with symbols is always stronger than a long passphrase.",
        answer: false,
        explanation: "Length is critical. Long unique passphrases are typically stronger than short complex strings.",
      },
      {
        id: "tf_04",
        prompt: "If breach monitoring alerts you, rotating passwords quickly lowers future risk.",
        answer: true,
        explanation: "Fast password rotation after alerts helps block credential stuffing attempts.",
      },
      {
        id: "tf_05",
        prompt: "Saving a password in plain text notes is a secure habit.",
        answer: false,
        explanation: "Plain text storage is insecure. Use a trusted password manager instead.",
      },
      {
        id: "tf_06",
        prompt: "Logging out suspicious sessions can help after unusual login activity.",
        answer: true,
        explanation: "Session lockdown reduces attacker persistence after suspicious access.",
      },
      {
        id: "tf_07",
        prompt: "A padlock icon in your browser means the website is completely safe.",
        answer: false,
        explanation: "The padlock means the connection is encrypted, but the site itself could still be fake.",
      },
      {
        id: "tf_08",
        prompt: "You should tell a trusted adult if something online makes you uncomfortable.",
        answer: true,
        explanation: "A parent, teacher, or guardian can help you handle scary or upsetting things online.",
      },
      {
        id: "tf_09",
        prompt: "It is okay to share your home address with someone you only know online.",
        answer: false,
        explanation: "Never share personal details online — people are not always who they say they are.",
      },
      {
        id: "tf_10",
        prompt: "Software updates often include important security fixes.",
        answer: true,
        explanation: "Updates patch security holes that hackers could use to break into your device.",
      },
      {
        id: "tf_11",
        prompt: "Free Wi-Fi at a shopping centre is always safe to use for banking.",
        answer: false,
        explanation: "Public Wi-Fi can be monitored by attackers. Use mobile data for sensitive tasks.",
      },
      {
        id: "tf_12",
        prompt: "A password manager helps you keep unique passwords for every account.",
        answer: true,
        explanation: "Password managers store and generate strong unique passwords so you don't have to remember them all.",
      },
      {
        id: "tf_13",
        prompt: "If a friend sends you a strange link, it is always safe to click it.",
        answer: false,
        explanation: "Your friend's account may have been hacked. Always verify before clicking unexpected links.",
      },
      {
        id: "tf_14",
        prompt: "Antivirus software can help protect your computer from malware.",
        answer: true,
        explanation: "Antivirus detects and removes harmful software before it can damage your device.",
      },
      {
        id: "tf_15",
        prompt: "Using your pet's name as a password is a good idea because it is easy to remember.",
        answer: false,
        explanation: "Personal info like pet names can be guessed from social media. Use random passphrases instead.",
      },
      {
        id: "tf_16",
        prompt: "A message that says 'you must act in 10 minutes' deserves extra checking.",
        answer: true,
        explanation: "Rushing you is a common scam trick. Slow down and check."
      },
      {
        id: "tf_17",
        prompt: "It is fine to share a one-time login code with someone who says they are from support.",
        answer: false,
        explanation: "Real support never asks for your code. Anyone who has it can get into your account."
      },
      {
        id: "tf_18",
        prompt: "Public Wi-Fi in a cafe is a safe place to log in to a bank account.",
        answer: false,
        explanation: "Other people on open Wi-Fi may be able to snoop. Use mobile data for private things."
      },
      {
        id: "tf_19",
        prompt: "Installing updates helps fix security holes in your apps.",
        answer: true,
        explanation: "Updates often close gaps that attackers use."
      },
      {
        id: "tf_20",
        prompt: "If a friend's account sends a strange link, it could have been hacked.",
        answer: true,
        explanation: "Check with your friend another way before you tap."
      },
      {
        id: "tf_21",
        prompt: "A website address starting with https can never be a scam site.",
        answer: false,
        explanation: "Scam sites can use https too. Check the name of the site as well."
      },
      {
        id: "tf_22",
        prompt: "Posting a photo of your school uniform can tell strangers where you go to school.",
        answer: true,
        explanation: "Small details in photos can give away where you are."
      },
      {
        id: "tf_23",
        prompt: "A game mod from an unknown website is always safe if lots of people downloaded it.",
        answer: false,
        explanation: "Download counts can be faked. Stick to official stores."
      },
      {
        id: "tf_24",
        prompt: "You should use a different password for your email than for your games.",
        answer: true,
        explanation: "If one is stolen, the other stays safe."
      },
      {
        id: "tf_25",
        prompt: "A pop-up saying your device has 5 viruses is usually telling the truth.",
        answer: false,
        explanation: "Scary pop-ups are adverts or scams. Close the tab and do not tap the buttons."
      },
      {
        id: "tf_26",
        prompt: "Locking your screen with a PIN protects you if you lose your phone.",
        answer: true,
        explanation: "A screen lock keeps a stranger out of your apps and photos."
      },
      {
        id: "tf_27",
        prompt: "It is safe to tell an online friend your home address if they seem nice.",
        answer: false,
        explanation: "You cannot be sure who someone online really is."
      },
      {
        id: "tf_28",
        prompt: "Backing up your photos means you still have them if your device breaks.",
        answer: true,
        explanation: "A backup is a second copy kept somewhere else."
      },
      {
        id: "tf_29",
        prompt: "Clicking 'unsubscribe' in a scam email is the best way to stop it.",
        answer: false,
        explanation: "It can show scammers your address is real. Mark it as spam instead."
      },
      {
        id: "tf_30",
        prompt: "A voice on the phone can be faked by AI to sound like someone you know.",
        answer: true,
        explanation: "If a call asks for money or secrets, hang up and ring the person back yourself."
      },
    ],
  },

  // =====================
  // PASSWORD STRENGTHENER
  // answer: number (0 = Weak, 1 = OK, 2 = Strong)
  // =====================
  passwordStrengthener: {
    label: "Password Strengthener",
    dailyCount: 7,
    reward: {
      correct: { riskDelta: -8, moodDelta: 3, healthDelta: 3 },
      incorrect: { riskDelta: 4, moodDelta: -2, healthDelta: -1 },
    },
    questions: [
      {
        id: "ps_01",
        prompt: "password123",
        answer: 0,
        explanation: "This is one of the most commonly guessed passwords in the world.",
      },
      {
        id: "ps_02",
        prompt: "blue-tiger-cloud-99",
        answer: 2,
        explanation: "A long passphrase with random words and a number is very hard to crack.",
      },
      {
        id: "ps_03",
        prompt: "Sophie2015",
        answer: 0,
        explanation: "A name and a year are easy to guess, especially from social media.",
      },
      {
        id: "ps_04",
        prompt: "Tr33H0use!",
        answer: 1,
        explanation: "It uses some tricks, but it is short and based on a common word.",
      },
      {
        id: "ps_05",
        prompt: "rocket-piano-garden-fish",
        answer: 2,
        explanation: "Four random words make a very long and hard-to-guess passphrase.",
      },
      {
        id: "ps_06",
        prompt: "abc123",
        answer: 0,
        explanation: "This is extremely short and one of the first passwords attackers try.",
      },
      {
        id: "ps_07",
        prompt: "M0untain!River$2024",
        answer: 2,
        explanation: "Long with mixed case, numbers, and symbols makes this very strong.",
      },
      {
        id: "ps_08",
        prompt: "iloveyou",
        answer: 0,
        explanation: "Common phrases are in every password cracking dictionary.",
      },
      {
        id: "ps_09",
        prompt: "Ch3rry!Jam",
        answer: 1,
        explanation: "Decent with symbols and numbers but a bit short for maximum security.",
      },
      {
        id: "ps_10",
        prompt: "qwerty",
        answer: 0,
        explanation: "Keyboard patterns are among the first things attackers check.",
      },
      {
        id: "ps_11",
        prompt: "correct-horse-battery-staple",
        answer: 2,
        explanation: "A famous example of a strong passphrase — long and random words are hard to crack.",
      },
      {
        id: "ps_12",
        prompt: "Football1",
        answer: 0,
        explanation: "A common word with just one number is very easy to guess.",
      },
      {
        id: "ps_13",
        prompt: "S@fe_Pass99",
        answer: 1,
        explanation: "Uses symbols and numbers but is based on predictable words.",
      },
      {
        id: "ps_14",
        prompt: "purple-sunset-train-42-lamp",
        answer: 2,
        explanation: "Five random words with a number make an excellent passphrase.",
      },
      {
        id: "ps_15",
        prompt: "letmein",
        answer: 0,
        explanation: "This is one of the top 10 most common passwords worldwide.",
      },
      {
        id: "ps_16",
        prompt: "qwerty",
        answer: 0,
        explanation: "Keyboard patterns are among the first things attackers try."
      },
      {
        id: "ps_17",
        prompt: "Liverpool2024",
        answer: 0,
        explanation: "A team name and a year are easy to guess."
      },
      {
        id: "ps_18",
        prompt: "purple-kettle-moon-river",
        answer: 2,
        explanation: "Four random words make a long passphrase that is hard to crack."
      },
      {
        id: "ps_19",
        prompt: "abc12345",
        answer: 0,
        explanation: "Simple sequences get guessed in seconds."
      },
      {
        id: "ps_20",
        prompt: "Tr33house!",
        answer: 1,
        explanation: "Mixed characters help, but it is short and based on one word."
      },
      {
        id: "ps_21",
        prompt: "sunny-otter-plays-drums-42",
        answer: 2,
        explanation: "Long, random and easy for you to picture."
      },
      {
        id: "ps_22",
        prompt: "iloveyou",
        answer: 0,
        explanation: "Common phrases are on every attacker's list."
      },
      {
        id: "ps_23",
        prompt: "Dublin#7",
        answer: 1,
        explanation: "A place name with a symbol is better than nothing, but still short and guessable."
      },
      {
        id: "ps_24",
        prompt: "xK9$mPq2vL7w",
        answer: 2,
        explanation: "Twelve random characters is strong. A password manager can remember it for you."
      },
      {
        id: "ps_25",
        prompt: "11111111",
        answer: 0,
        explanation: "Repeating one character gives almost no protection."
      },
      {
        id: "ps_26",
        prompt: "MyDogMax",
        answer: 0,
        explanation: "Pet names are easy to find out."
      },
      {
        id: "ps_27",
        prompt: "frozen-pizza-jumps-high",
        answer: 2,
        explanation: "Random words together are long and hard to guess."
      },
      {
        id: "ps_28",
        prompt: "Summer!23",
        answer: 1,
        explanation: "Season plus year is a common pattern, even with a symbol."
      },
      {
        id: "ps_29",
        prompt: "letmein",
        answer: 0,
        explanation: "One of the most used passwords in the world."
      },
      {
        id: "ps_30",
        prompt: "giraffe.cloud.sock.piano",
        answer: 2,
        explanation: "Unrelated words make a strong passphrase."
      },
    ],
  },

  // =====================
  // FILL IN THE BLANKS
  // answer: number (index of the correct option)
  // options: array of choices
  // =====================
  fillBlanks: {
    label: "Fill in the Blanks",
    dailyCount: 7,
    reward: {
      correct: { riskDelta: -7, moodDelta: 3, healthDelta: 2 },
      incorrect: { riskDelta: 4, moodDelta: -2, healthDelta: -2 },
    },
    questions: [
      {
        id: "fb_01",
        prompt: "Never share your _____ with strangers online.",
        options: ["password", "favourite colour", "favourite movie"],
        answer: 0,
        explanation: "Your password is private — only share it with a trusted adult at home.",
      },
      {
        id: "fb_02",
        prompt: "If something online makes you feel scared, tell a trusted _____.",
        options: ["stranger", "adult", "chatbot"],
        answer: 1,
        explanation: "A parent, teacher, or guardian can help you stay safe.",
      },
      {
        id: "fb_03",
        prompt: "Before clicking a link in an email, check the _____ address.",
        options: ["sender's", "home", "IP"],
        answer: 0,
        explanation: "Checking who sent the email helps you spot fakes.",
      },
      {
        id: "fb_04",
        prompt: "A strong password should be _____ and hard to guess.",
        options: ["short", "long", "your name"],
        answer: 1,
        explanation: "Longer passwords are much harder for hackers to crack.",
      },
      {
        id: "fb_05",
        prompt: "Only download apps from the _____ app store.",
        options: ["official", "fastest", "cheapest"],
        answer: 0,
        explanation: "Official stores check apps for safety before you download them.",
      },
      {
        id: "fb_06",
        prompt: "You should _____ your device software when updates are available.",
        options: ["ignore", "update", "delete"],
        answer: 1,
        explanation: "Updates fix security problems that hackers could use to break in.",
      },
      {
        id: "fb_07",
        prompt: "A _____ manager helps you store all your passwords safely.",
        options: ["password", "file", "screen"],
        answer: 0,
        explanation: "Password managers keep your login details encrypted and secure.",
      },
      {
        id: "fb_08",
        prompt: "Two-factor authentication adds an extra _____ of security.",
        options: ["layer", "risk", "cost"],
        answer: 0,
        explanation: "2FA means even if someone gets your password, they still need a second code.",
      },
      {
        id: "fb_09",
        prompt: "Public Wi-Fi is _____ secure than your home network.",
        options: ["more", "less", "equally"],
        answer: 1,
        explanation: "Anyone on the same public network could potentially see your data.",
      },
      {
        id: "fb_10",
        prompt: "If you get a message from an unknown person asking for personal info, you should _____ it.",
        options: ["answer", "ignore", "forward"],
        answer: 1,
        explanation: "Never reply to strangers asking for personal information.",
      },
      {
        id: "fb_11",
        prompt: "You should use a _____ password for each account.",
        options: ["same", "different", "simple"],
        answer: 1,
        explanation: "Using different passwords means one breach won't affect all your accounts.",
      },
      {
        id: "fb_12",
        prompt: "Clicking pop-up ads can sometimes install _____ on your device.",
        options: ["updates", "malware", "passwords"],
        answer: 1,
        explanation: "Pop-ups can trick you into downloading harmful software.",
      },
      {
        id: "fb_13",
        prompt: "Before posting a photo online, think about what _____ information it might reveal.",
        options: ["personal", "funny", "old"],
        answer: 0,
        explanation: "Photos can reveal your location, school, or other private details.",
      },
      {
        id: "fb_14",
        prompt: "A phishing email often tries to create a sense of _____.",
        options: ["calm", "urgency", "boredom"],
        answer: 1,
        explanation: "Scammers use urgency to make you act before thinking.",
      },
      {
        id: "fb_15",
        prompt: "When creating an account, your _____ should not contain your real name.",
        options: ["username", "email subject", "profile picture"],
        answer: 0,
        explanation: "Using your real name in usernames makes it easier for strangers to find you.",
      },
      {
        id: "fb_16",
        prompt: "A code sent to your phone when you log in is called two-factor _____.",
        options: [
          "authentication",
          "advertising",
          "animation"
        ],
        answer: 0,
        explanation: "It adds a second check on top of your password."
      },
      {
        id: "fb_17",
        prompt: "If an offer sounds too good to be _____, it probably is.",
        options: [
          "cheap",
          "true",
          "late"
        ],
        answer: 1,
        explanation: "Unbelievable deals are bait."
      },
      {
        id: "fb_18",
        prompt: "Keep your apps and device up to _____.",
        options: [
          "date",
          "speed",
          "volume"
        ],
        answer: 0,
        explanation: "Updates fix security problems."
      },
      {
        id: "fb_19",
        prompt: "A fake message that tries to trick you is called _____.",
        options: [
          "phishing",
          "surfing",
          "streaming"
        ],
        answer: 0,
        explanation: "Phishing messages pretend to be someone you trust."
      },
      {
        id: "fb_20",
        prompt: "Use a password _____ to remember lots of strong passwords.",
        options: [
          "notebook",
          "manager",
          "sticker"
        ],
        answer: 1,
        explanation: "A password manager stores them safely for you."
      },
      {
        id: "fb_21",
        prompt: "Set your social media profile to _____.",
        options: [
          "public",
          "private",
          "famous"
        ],
        answer: 1,
        explanation: "Private profiles keep strangers from seeing your posts."
      },
      {
        id: "fb_22",
        prompt: "Think before you _____ a photo online.",
        options: [
          "post",
          "print",
          "paint"
        ],
        answer: 0,
        explanation: "Once it is shared, you cannot fully take it back."
      },
      {
        id: "fb_23",
        prompt: "Never pay a stranger with gift _____.",
        options: [
          "wrap",
          "cards",
          "bags"
        ],
        answer: 1,
        explanation: "Gift card payments are a scammer favourite."
      },
      {
        id: "fb_24",
        prompt: "Hover over or long-press a _____ to see where it really goes.",
        options: [
          "link",
          "photo",
          "emoji"
        ],
        answer: 0,
        explanation: "The real address can be different from the text you see."
      },
      {
        id: "fb_25",
        prompt: "Lock your phone with a PIN or your _____.",
        options: [
          "fingerprint",
          "nickname",
          "birthday"
        ],
        answer: 0,
        explanation: "A fingerprint or PIN keeps other people out."
      },
      {
        id: "fb_26",
        prompt: "If you are not sure about a message, ask a trusted _____.",
        options: [
          "adult",
          "advert",
          "app"
        ],
        answer: 0,
        explanation: "A second opinion stops a lot of scams."
      },
      {
        id: "fb_27",
        prompt: "Log _____ of shared computers when you finish.",
        options: [
          "into",
          "out",
          "over"
        ],
        answer: 1,
        explanation: "Otherwise the next person can use your account."
      },
      {
        id: "fb_28",
        prompt: "A program that harms your device is called _____.",
        options: [
          "hardware",
          "malware",
          "homeware"
        ],
        answer: 1,
        explanation: "Malware is short for malicious software."
      },
      {
        id: "fb_29",
        prompt: "Only accept friend requests from people you _____.",
        options: [
          "know",
          "like the look of",
          "have never met"
        ],
        answer: 0,
        explanation: "Strangers online may not be who they say."
      },
      {
        id: "fb_30",
        prompt: "Scammers create a feeling of _____ so you act without thinking.",
        options: [
          "urgency",
          "boredom",
          "calm"
        ],
        answer: 0,
        explanation: "Pressure is the oldest trick in the book."
      },
    ],
  },
};

export default cyberPetMiniGames;
