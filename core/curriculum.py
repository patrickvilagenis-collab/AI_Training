"""
Curriculum content for the AI Training app.

The data here is the single source of truth for what learners see. It is served
to the browser as JSON via the /api/curriculum endpoint and rendered entirely
on the client, keeping the backend thin.

Structure
---------
CURRICULUM = [ week, week, ... ]
  week = {
      "id", "title", "subtitle", "icon", "color",
      "sessions": [ session, ... ],
  }
  session = {
      "id", "title", "subtitle", "xp",
      "exercises": [ exercise, ... ],
  }

Exercise types
--------------
- "info"        : a teaching card, no answer required. {title, body}
- "mcq"         : multiple choice. {prompt, options[], answer (index), explain}
- "fill_blank"  : type/choose the missing word. {prompt, options[], answer(index), explain}
- "matching"    : pair items from two columns. {prompt, pairs[[left,right],...], explain}
- "true_false"  : {prompt, answer(bool), explain}
"""

CURRICULUM = [
    # =====================================================================
    # WEEK 1 — What is Machine Learning
    # =====================================================================
    {
        "id": "w1",
        "title": "What is Machine Learning?",
        "subtitle": "The big ideas behind AI that learns",
        "icon": "🤖",
        "color": "#58cc02",
        "sessions": [
            {
                "id": "w1s1",
                "title": "Meet Machine Learning",
                "subtitle": "Why machines can 'learn' at all",
                "xp": 20,
                "exercises": [
                    {
                        "type": "info",
                        "title": "Learning from examples",
                        "body": "Traditional software follows rules a human wrote by hand. "
                                "Machine Learning (ML) flips this: instead of writing rules, "
                                "we show a computer lots of <b>examples</b> and let it find the "
                                "patterns itself. 🍎",
                    },
                    {
                        "type": "mcq",
                        "prompt": "What makes Machine Learning different from normal programming?",
                        "options": [
                            "It learns patterns from data instead of using hand-written rules",
                            "It runs faster than all other software",
                            "It never makes mistakes",
                            "It only works on supercomputers",
                        ],
                        "answer": 0,
                        "explain": "ML learns patterns from data, rather than following rules a "
                                   "programmer typed out by hand.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "A spam filter that improves as it sees more flagged emails is using Machine Learning.",
                        "answer": True,
                        "explain": "Yes! Learning from labelled examples (spam / not spam) is "
                                   "a classic ML use case.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "In Machine Learning, the examples we learn from are called the ____.",
                        "options": ["data", "rules", "buttons", "wires"],
                        "answer": 0,
                        "explain": "Data is the fuel of ML — more good examples usually means "
                                   "better learning.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Which of these is the BEST job for Machine Learning?",
                        "options": [
                            "Recognising cats in millions of photos",
                            "Adding 2 + 2",
                            "Storing a file on disk",
                            "Turning a light on with a switch",
                        ],
                        "answer": 0,
                        "explain": "ML shines on fuzzy pattern problems (like images) that are "
                                   "hard to write exact rules for.",
                    },
                ],
            },
            {
                "id": "w1s2",
                "title": "Three Flavours of Learning",
                "subtitle": "Supervised, unsupervised & reinforcement",
                "xp": 20,
                "exercises": [
                    {
                        "type": "info",
                        "title": "The three families",
                        "body": "ML comes in three main styles:<br><br>"
                                "• <b>Supervised</b> — learn from labelled examples (this is a cat 🐱)<br>"
                                "• <b>Unsupervised</b> — find hidden groups with no labels<br>"
                                "• <b>Reinforcement</b> — learn by trial, reward & error 🎮",
                    },
                    {
                        "type": "mcq",
                        "prompt": "You have 10,000 photos each labelled 'dog' or 'cat'. Which type of learning fits?",
                        "options": ["Supervised", "Unsupervised", "Reinforcement", "None of these"],
                        "answer": 0,
                        "explain": "Labelled examples → supervised learning.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "A model groups customers into segments WITHOUT any labels. This is…",
                        "options": ["Unsupervised", "Supervised", "Reinforcement", "Manual"],
                        "answer": 0,
                        "explain": "Finding structure without labels is unsupervised learning "
                                   "(here, clustering).",
                    },
                    {
                        "type": "matching",
                        "prompt": "Match each scenario to its learning type:",
                        "pairs": [
                            ["Predict house price from labelled sales", "Supervised"],
                            ["Group songs by sound, no labels", "Unsupervised"],
                            ["Teach a robot to walk via rewards", "Reinforcement"],
                        ],
                        "explain": "Labels → supervised, no labels/grouping → unsupervised, "
                                   "rewards → reinforcement.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "Reinforcement learning improves by receiving rewards for good actions.",
                        "answer": True,
                        "explain": "Correct — think of it like training a pet with treats. 🦴",
                    },
                ],
            },
            {
                "id": "w1s3",
                "title": "ML in Everyday Life",
                "subtitle": "You already use it every day",
                "xp": 25,
                "exercises": [
                    {
                        "type": "info",
                        "title": "Hidden in plain sight",
                        "body": "Netflix recommendations, map ETAs, photo face-tagging, voice "
                                "assistants and bank fraud alerts are all powered by ML. "
                                "You interact with dozens of models before lunch! 🍔",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Which everyday feature is powered by Machine Learning?",
                        "options": [
                            "Video recommendations on a streaming app",
                            "The volume up button",
                            "The device clock",
                            "A flashlight toggle",
                        ],
                        "answer": 0,
                        "explain": "Recommendation systems learn your taste from your behaviour.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "When your phone gallery groups photos of the same friend, it is doing face ____.",
                        "options": ["recognition", "deletion", "printing", "charging"],
                        "answer": 0,
                        "explain": "Face recognition is a computer-vision ML task.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Why do these systems sometimes get things wrong?",
                        "options": [
                            "They predict from patterns, so unusual cases can fool them",
                            "Computers are allergic to data",
                            "They run out of electricity",
                            "They get bored",
                        ],
                        "answer": 0,
                        "explain": "Models are statistical guessers — rare or biased inputs can "
                                   "lead to mistakes.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "More and better-quality data usually helps an ML model perform better.",
                        "answer": True,
                        "explain": "Generally true — quality data is gold for ML. ✨",
                    },
                    {
                        "type": "mcq",
                        "prompt": "What is a 'model' in Machine Learning?",
                        "options": [
                            "The learned pattern that turns inputs into predictions",
                            "A fashion mannequin",
                            "The computer's power supply",
                            "A type of keyboard",
                        ],
                        "answer": 0,
                        "explain": "A model is the trained 'recipe' that maps inputs to outputs.",
                    },
                ],
            },
        ],
    },

    # =====================================================================
    # WEEK 2 — Neural Networks
    # =====================================================================
    {
        "id": "w2",
        "title": "Neural Networks",
        "subtitle": "How AI mimics the brain",
        "icon": "🧠",
        "color": "#1cb0f6",
        "sessions": [
            {
                "id": "w2s1",
                "title": "Neurons & Layers",
                "subtitle": "The building blocks",
                "xp": 20,
                "exercises": [
                    {
                        "type": "info",
                        "title": "Tiny decision-makers",
                        "body": "A neural network is built from <b>neurons</b> — simple units that "
                                "take numbers in, weigh them, and pass a signal on. Stack neurons "
                                "into <b>layers</b> and the network can learn very complex patterns. 🧩",
                    },
                    {
                        "type": "mcq",
                        "prompt": "What is the basic unit of a neural network?",
                        "options": ["A neuron", "A pixel", "A folder", "A cable"],
                        "answer": 0,
                        "explain": "Neurons (also called nodes) are the building blocks.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "Neurons are organised into ____ that stack to form a deep network.",
                        "options": ["layers", "boxes", "pages", "songs"],
                        "answer": 0,
                        "explain": "Layers stacked together create depth — hence 'deep' learning.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Each connection between neurons has a number called a…",
                        "options": ["weight", "color", "label", "title"],
                        "answer": 0,
                        "explain": "Weights decide how much influence one neuron has on the next.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "A network with many layers between input and output is called 'deep'.",
                        "answer": True,
                        "explain": "Yes — that's literally where the term 'deep learning' comes from.",
                    },
                ],
            },
            {
                "id": "w2s2",
                "title": "How Networks Learn",
                "subtitle": "Training, errors & adjustment",
                "xp": 25,
                "exercises": [
                    {
                        "type": "info",
                        "title": "Practice makes perfect",
                        "body": "Training shows the network examples, measures how wrong it is "
                                "(the <b>loss</b>), and nudges the weights to do better next time. "
                                "Repeat millions of times and it gets scarily good. 🔁",
                    },
                    {
                        "type": "mcq",
                        "prompt": "During training, what does the 'loss' measure?",
                        "options": [
                            "How wrong the model's predictions are",
                            "How much power the GPU uses",
                            "How many files were deleted",
                            "The size of the screen",
                        ],
                        "answer": 0,
                        "explain": "Loss = error. Training tries to make the loss as small as possible.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "Training adjusts the network's ____ to reduce its errors.",
                        "options": ["weights", "colors", "fonts", "cables"],
                        "answer": 0,
                        "explain": "Learning = gradually tuning the weights.",
                    },
                    {
                        "type": "matching",
                        "prompt": "Match the training term to its meaning:",
                        "pairs": [
                            ["Loss", "How wrong the model is"],
                            ["Weights", "Numbers the model tunes"],
                            ["Epoch", "One full pass over the data"],
                        ],
                        "explain": "Loss measures error, weights are tuned, and an epoch is one "
                                   "sweep through the dataset.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "What usually happens to the loss as training goes well?",
                        "options": ["It goes down", "It goes up", "It stays at zero", "It disappears"],
                        "answer": 0,
                        "explain": "Falling loss means the model is getting more accurate. 📉",
                    },
                    {
                        "type": "true_false",
                        "prompt": "A model that memorises the training data but fails on new data is 'overfitting'.",
                        "answer": True,
                        "explain": "Exactly — overfitting is memorising instead of truly learning.",
                    },
                ],
            },
            {
                "id": "w2s3",
                "title": "Deep Learning Powers",
                "subtitle": "What deep nets can do",
                "xp": 25,
                "exercises": [
                    {
                        "type": "info",
                        "title": "From pixels to language",
                        "body": "Deep networks power image recognition, speech-to-text, translation "
                                "and the large language models behind modern chatbots. The same core "
                                "idea — layers of neurons — scales to astonishing abilities. 🚀",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Which task is a great fit for deep learning?",
                        "options": [
                            "Recognising objects in an image",
                            "Counting to ten",
                            "Sorting 3 numbers",
                            "Storing a contact",
                        ],
                        "answer": 0,
                        "explain": "Rich, high-dimensional inputs like images are deep learning's "
                                   "home turf.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "The chatbots you talk to are built on Large ____ Models.",
                        "options": ["Language", "Lego", "Library", "Lemonade"],
                        "answer": 0,
                        "explain": "LLMs — Large Language Models — predict and generate text.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Why do deep networks usually need lots of data?",
                        "options": [
                            "They have many weights to tune, which needs many examples",
                            "Data keeps the computer warm",
                            "It is a legal requirement",
                            "They get lonely",
                        ],
                        "answer": 0,
                        "explain": "Millions of parameters need lots of examples to set them well.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "The same neural-network idea can handle images, sound AND text.",
                        "answer": True,
                        "explain": "True — it's a remarkably general approach.",
                    },
                ],
            },
        ],
    },

    # =====================================================================
    # WEEK 3 — Prompting Techniques
    # =====================================================================
    {
        "id": "w3",
        "title": "Prompting Techniques",
        "subtitle": "Talk to AI like a pro",
        "icon": "💬",
        "color": "#ce82ff",
        "sessions": [
            {
                "id": "w3s1",
                "title": "Prompt Basics",
                "subtitle": "Clear in, clear out",
                "xp": 20,
                "exercises": [
                    {
                        "type": "info",
                        "title": "A prompt is an instruction",
                        "body": "A <b>prompt</b> is what you type to an AI. The clearer and more "
                                "specific your prompt, the better the answer. Vague in → vague out. 🎯",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Which prompt is likely to get the most useful answer?",
                        "options": [
                            "'Write a 3-bullet summary of this email for a busy manager'",
                            "'do email'",
                            "'email???'",
                            "'help'",
                        ],
                        "answer": 0,
                        "explain": "Specific task + format + audience = a strong prompt.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "Good prompts are clear and ____ about what you want.",
                        "options": ["specific", "secret", "silent", "slow"],
                        "answer": 0,
                        "explain": "Specificity is the #1 prompting skill.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Adding 'Explain it like I'm 10 years old' to a prompt controls the…",
                        "options": ["tone and reading level", "screen brightness", "wifi speed", "font"],
                        "answer": 0,
                        "explain": "You can steer style, tone and complexity right in the prompt.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "Telling the AI WHO the answer is for (the audience) usually improves it.",
                        "answer": True,
                        "explain": "Audience context helps the AI pick the right tone and detail.",
                    },
                ],
            },
            {
                "id": "w3s2",
                "title": "Power Techniques",
                "subtitle": "Roles, examples & steps",
                "xp": 25,
                "exercises": [
                    {
                        "type": "info",
                        "title": "Level-up your prompts",
                        "body": "Three pro moves:<br><br>"
                                "• <b>Role</b> — 'Act as a travel agent…'<br>"
                                "• <b>Examples</b> (few-shot) — show 1–2 samples of what you want<br>"
                                "• <b>Steps</b> — 'Think step by step' for tricky reasoning 🧗",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Giving the AI examples of the output you want is called…",
                        "options": ["Few-shot prompting", "Cold booting", "Hard resetting", "Overclocking"],
                        "answer": 0,
                        "explain": "Few-shot = showing a few examples to guide the format/style.",
                    },
                    {
                        "type": "matching",
                        "prompt": "Match the technique to its example phrase:",
                        "pairs": [
                            ["Role prompting", "'Act as a senior chef'"],
                            ["Few-shot", "'Here are 2 examples to copy'"],
                            ["Step-by-step", "'Think it through one step at a time'"],
                        ],
                        "explain": "Roles set persona, few-shot shows examples, step-by-step "
                                   "encourages reasoning.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "Asking the model to 'think ____ by step' can improve hard reasoning.",
                        "options": ["step", "skip", "stop", "swim"],
                        "answer": 0,
                        "explain": "Step-by-step prompting helps with multi-stage problems.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Why ask the AI to 'act as an expert editor'?",
                        "options": [
                            "It sets a helpful persona that shapes the response",
                            "It makes the computer faster",
                            "It unlocks secret features",
                            "It saves battery",
                        ],
                        "answer": 0,
                        "explain": "Role prompts prime the style and depth of the answer.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "If a first answer isn't right, refining and re-asking is a normal part of prompting.",
                        "answer": True,
                        "explain": "Iteration is expected — treat it as a conversation. 🔄",
                    },
                ],
            },
            {
                "id": "w3s3",
                "title": "Prompting for Work",
                "subtitle": "Coding & content with AI",
                "xp": 30,
                "exercises": [
                    {
                        "type": "info",
                        "title": "AI as your sidekick",
                        "body": "AI can draft code, explain errors, brainstorm content, and rewrite "
                                "text for different audiences. The skill is describing the task, the "
                                "constraints, and the format you want. 🛠️",
                    },
                    {
                        "type": "mcq",
                        "prompt": "Best prompt for a coding helper?",
                        "options": [
                            "'Write a Python function that reverses a string, with a comment and an example'",
                            "'make code'",
                            "'python'",
                            "'fix it'",
                        ],
                        "answer": 0,
                        "explain": "State the language, the exact task, and the format you want back.",
                    },
                    {
                        "type": "mcq",
                        "prompt": "You got code that errors. A great next prompt is…",
                        "options": [
                            "'Here is the error message — explain the cause and fix it'",
                            "'why broken'",
                            "'redo'",
                            "'ugh'",
                        ],
                        "answer": 0,
                        "explain": "Paste the error and ask for cause + fix. Context is everything.",
                    },
                    {
                        "type": "fill_blank",
                        "prompt": "For content, telling the AI the target ____ (e.g. teens vs. execs) shapes the tone.",
                        "options": ["audience", "altitude", "alphabet", "appliance"],
                        "answer": 0,
                        "explain": "Audience drives vocabulary, length and tone.",
                    },
                    {
                        "type": "matching",
                        "prompt": "Match the work task to a useful instruction:",
                        "pairs": [
                            ["Summarise a report", "'Give 3 key bullets + 1 action'"],
                            ["Debug code", "'Explain the error, then fix it'"],
                            ["Write a post", "'Friendly tone, under 100 words'"],
                        ],
                        "explain": "Each task benefits from a clear format and constraint.",
                    },
                    {
                        "type": "true_false",
                        "prompt": "You should always review AI output before trusting or shipping it.",
                        "answer": True,
                        "explain": "Yes — AI can be confidently wrong. You're the editor-in-chief. ✅",
                    },
                    {
                        "type": "mcq",
                        "prompt": "What's the single biggest lever for better AI results?",
                        "options": [
                            "A clear, specific, well-structured prompt",
                            "Typing in ALL CAPS",
                            "Asking many times quickly",
                            "Using a bigger monitor",
                        ],
                        "answer": 0,
                        "explain": "Clarity and structure beat everything else. You've got this! 🎉",
                    },
                ],
            },
        ],
    },
]


# A teaser of what's coming, shown on the dashboard to drive weekly engagement.
UPCOMING = [
    {"title": "Computer Vision", "icon": "👁️", "subtitle": "How AI sees the world"},
    {"title": "AI Ethics & Safety", "icon": "⚖️", "subtitle": "Using AI responsibly"},
    {"title": "Building with AI APIs", "icon": "🔌", "subtitle": "Add AI to your own apps"},
]


def total_xp_available():
    """Sum of all XP across every session — handy for progress bars."""
    return sum(s["xp"] for w in CURRICULUM for s in w["sessions"])
