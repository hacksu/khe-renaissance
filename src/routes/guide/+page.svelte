<script lang="ts">
    import Accordion from "../../components/Accordion.svelte";
    import Card from "../../components/Card.svelte";

    let selected = 0;
    const projects = [
        {
            title: "Escape Pursuit (HackPSU Spring 2024)",
            link: "https://devpost.com/software/escape-pursuit",
            image: "/example_projects/escape.jpg",
            description: [
                "This online game adds an online component to hide-and-seek: both the hider and the seekers bring up the game on their phones, and then when the hider hides, the seekers are shown a randomly-placed circle on the map that the hider is somewhere within. The hider can explore a wide range of possible hiding spots, across a whole college campus, for example, but the game stays fair.",
                "This simple enhancement to an age-old pastime shows how technology can be integrated with the real world in a new way to create something fun."
            ],
            tech: "Angular, MongoDB, Google Maps, Cloudflare Workers"
        },
        {
            title: "RTCL (KHE 2022)",
            link: "https://devpost.com/software/rtcl-article",
            image: "/example_projects/rtcl.jpg",
            description: [
                "This was a Python program that read PDFs and, with the help of a language model, created PowerPoint slides that summarized their contents.",
                "These days, everyone knows AI can do this kind of thing, but back in October 2022, before ChatGPT, this blew people's minds. This project found an application of technology that people weren't used to yet."
            ],
            tech: "pdfminer, Cohere NLP, pptx"
        },
        {
            title: "Single-Handed Typing (KHE 2022)",
            link: "https://devpost.com/software/singlehanded-typing-tech",
            image: "/example_projects/singlehanded.jpg",
            description: [
                "This was a project created by someone who once broke their arm and wasn't able to type with one of their hands. To improve this kind of situation for everyone, they decided to try to implement an old idea for a dynamic one-handed keyboard layout they found.",
                "This project wasn't completely original, but it did iterate on a forgotten concept that then only existed in old Linux config files. Sometimes you just need someone to actually make the thing."
            ],
            tech: "keyboard, PyQt, Vue, Nuxt"
        },
        {
            title: "FaunaFinder (MakeUC 2023)",
            link: "https://devpost.com/software/faunafinder-ai-powered-animal-breed-recognition",
            image: "/example_projects/fauna.jpg",
            description: [
                "This AI-based application recognizes pictures of animals, brings up information about the species of those animals, and tells you about related animals that you might also want to know about.",
                "There is still a lot of untapped potential within the world of AI, probably, and this project used it to connect people with animals."
            ],
            tech: "Flask, Google Cloud Vision, Wikipedia/animal APIs"
        },
        {
            title: "Subway Cheese Chase (MakeUC 2023)",
            link: "https://devpost.com/software/subway-cheese-chase",
            image: "/example_projects/subway.jpg",
            description: [
                "This is simply a horror game about being in a dark Subway (restaurant) looking for your car keys.",
                "Not every hackathon project has to be super serious!"
            ],
            tech: "Godot, Blender"
        },
        {
            title: "CWRU Full-Text Class Search (KHE 2019)",
            link: "https://devpost.com/software/cwru-full-text-class-search",
            image: "/example_projects/cwru_classes.jpg",
            description: [
                "This was a project developed by students from Case Western Reserve University who disapproved of their university's portal for class searches. So, they scraped the content of the portal and made their own website out of it.",
                "This project identified a part of our built environment that sucks and decided to try to fix it."
            ],
            tech: "Scrapy, MongoDB, Elasticsearch, Google Cloud"
        },
        {
            title: "Safe-Roads (MakeUC 2023)",
            link: "https://devpost.com/software/safe-roads",
            image: "/example_projects/safe_roads.jpg",
            description: [
                "This project uses publicly-available maps and data to visualize how dangerous any given segment of road is. I imagine this is perfect for anyone who's already anxious about driving.",
                "This project shows how useful public datasets from websites like Kaggle can be if given the right frame. The Internet has a ton of information on it that just needs a little bit of data science done to it to become relevant and accessible in people's lives."
            ],
            tech: "Google Maps API, Streamlit"
        }
    ];
</script>

<style>
  /* Make all links in the guide a lighter blue, except those with a custom class or .table-link */
  .guide-content a:not(.text-blue-600):not(.table-link) {
    color: #60a5fa; /* Tailwind's blue-400, lighter */
    text-decoration: underline;
    transition: color 0.15s;
  }
  .guide-content a:not(.text-blue-600):not(.table-link):hover {
    color: #3b82f6; /* Tailwind's blue-500 */
  }
  /* Table links: dark blue (default link color) */
  .guide-content table a.table-link {
    color: #1d4ed8; /* Tailwind's blue-700 */
    text-decoration: underline;
    transition: color 0.15s;
  }
  .guide-content table a.table-link:hover {
    color: #2563eb; /* Tailwind's blue-600 */
  }
</style>

<div class="py-24 px-4 md:px-24 lg:px-60 xl:px-96 flex flex-col gap-4 justify-center text-black guide-content">
    <Card padded>
        <div class="w-full">
            <h1 class="font-bold text-4xl mb-6">A Quickstart Guide to Hackathons</h1>
            <p class="text-xl mb-4">
                Throwing together a revolutionary new product that <strong>shakes the world to its core</strong> and <strong><em>permanently changes humans' relationship with technology</em></strong> in less than 24 hours might sound hard, <strong>but it's really not.</strong>
            </p>
            <p>
                All you need is an idea and the tools to implement it. For example:
            </p>

            <h2 class="text-3xl text-center my-6">~ Previous Projects ~</h2>
            <div class="flex justify-center mb-4 gap-2">
                {#each projects as _, i}
                    <button
                        class="px-3 py-1 rounded border font-bold transition-colors duration-150 {selected === i ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}"
                        on:click={() => selected = i}
                        aria-label={`Show project ${i + 1}`}
                    >
                        {i + 1}
                    </button>
                {/each}
            </div>
            <div class="border rounded-lg p-4 shadow flex flex-col items-center">
                <h3 class="font-bold text-lg">{projects[selected].title}</h3>
                <a href={projects[selected].link} target="_blank" class="text-blue-600 underline">View on Devpost</a>
                <img src={projects[selected].image} alt={projects[selected].title} class="my-2 rounded max-h-48 w-auto" style="max-width: 300px;" />
                {#each projects[selected].description as desc}
                    <p>{desc}</p>
                {/each}
                <p class="text-sm mt-2">
                    <strong>Technologies used:</strong><br />
                    {projects[selected].tech}
                </p>
            </div>

            <p class="mt-6">
                <a href="https://devpost.com/software" class="text-blue-600 underline">For even more projects, browse the global project gallery on Devpost.</a>
            </p>

            <h3 class="text-2xl font-bold mt-8">Key takeaways for success:</h3>
            <ul class="list-disc ml-6">
                <li>Keep the scope of your project narrow - if you have an idea, try to just implement the core of it.</li>
                <li><strong>Put a little hot sauce on that bad boy.</strong></li>
                <li>Use libraries written in your chosen language that solve hard problems.</li>
                <li>Use a high-level framework that takes care of the routine details of the kind of project you're working on.</li>
            </ul>
            <p class="mt-4">For more on those last two points, read on:</p>

            <h2 class="text-3xl font-bold mt-10 mb-4">Technologies</h2>
            <div class="my-6">
                <h3 class="text-2xl font-bold mb-2">Web Development</h3>
                <p>This is the most common way to create apps, using centralized data and computation and convenient graphical user interfaces.</p>
                <img src="/technology_guide/www.gif" alt="A retro animated spinning globe." class="mx-auto my-4" style="max-width: 270px; width: 100%;" />
                <p>The web technologies that were originally developed for the creation of Geocities pages and mailing list address forms eventually broke containment and infiltrated every single facet of the modern graphical user interface-based world.</p>
                <p>Generally, to use them, you need to create a <strong>backend server application</strong> that can store data, make itself available on a network, and usually do most of the actual work that the thing you're making needs to do. When a web browser (aka a <strong>client</strong>) connects to it, the backend server will send <strong>client-side code</strong> to the browser that will tell the browser what to display to the user. The server application is known as the <strong>backend</strong>; the client-side code is called the <strong>frontend</strong>.</p>
                <p>Here is a list of some of the more currently popular backend/frontend combos in very approximately escalating order of complexity:</p>
                <div class="overflow-x-auto my-4">
                    <table class="min-w-full border border-gray-400 rounded-lg">
                        <thead class="bg-gray-700 text-black">
                            <tr>
                                <th class="px-4 py-2 border-b border-gray-400 text-left">Backend</th>
                                <th class="px-4 py-2 border-b border-gray-400 text-left">Frontend</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-50 text-black">
                                <td class="px-4 py-2 border-b border-gray-300">None</td>
                                <td class="px-4 py-2 border-b border-gray-300"><a href="https://developer.mozilla.org/en-US/docs/Learn/HTML" class="table-link">HTML files</a></td>
                            </tr>
                            <tr class="bg-white text-black">
                                <td class="px-4 py-2 border-b border-gray-300"><a href="https://flask.palletsprojects.com/en/3.0.x/" class="table-link">Flask</a> (Python library)</td>
                                <td class="px-4 py-2 border-b border-gray-300"><a href="https://jinja.palletsprojects.com/en/3.1.x/" class="table-link">Jinja HTML templates</a></td>
                            </tr>
                            <tr class="bg-gray-50 text-black">
                                <td class="px-4 py-2 border-b border-gray-300"><a href="https://expressjs.com" class="table-link">Express.js</a> (JavaScript library)</td>
                                <td class="px-4 py-2 border-b border-gray-300">Interactive components using <a href="https://vuejs.org/" class="table-link">Vue</a> & <a href="https://vitejs.dev/" class="table-link">Vite</a> (more JavaScript)</td>
                            </tr>
                            <tr class="bg-white text-black">
                                <td class="px-4 py-2 border-b border-gray-300" colspan="2"><a href="https://nextjs.org/" class="table-link">Next.js</a> (JavaScript backend + <a href="https://react.dev/" class="table-link">React</a> frontend components.)</td>
                            </tr>
                            <tr class="bg-gray-50 text-black">
                                <td class="px-4 py-2 border-b border-gray-300">Serverless Functions, deployed to <a href="https://vercel.com/" class="table-link">Vercel</a> or <a href="https://www.netlify.com/" class="table-link">Netlify</a></td>
                                <td class="px-4 py-2 border-b border-gray-300">Static site generation with a framework like <a href="https://astro.build/" class="table-link">Astro</a><br />(The <a href="https://jamstack.org/" class="table-link">Jamstack</a> approach)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p><strong><a href="https://flask.palletsprojects.com/en/3.0.x/">Flask with Jinja templates</a></strong> is popular and highly recommended for fairly straightforward static websites.</p>
                <p><strong><a href="https://nextjs.org/">Next.js</a></strong> is popular and highly recommended for somewhat more polished and complex user interfaces, if you're willing to deal with writing JavaScript for the frontend and backend at the same time.</p>
                <h2 class="text-xl font-bold mt-6">Follow-up points:</h2>
                <ul class="list-disc ml-6">
                    <li>Yes, there are several zillion web development frameworks. We'll come up with one that leaves your sanity intact eventually.</li>
                    <li>Note that you need to download <a href="https://nodejs.org/en">Node.js</a> to run JavaScript outside of the browser just like you need to download <a href="https://www.python.org/downloads/">Python</a> to run Python.</li>
                    <li>Backend code can be written in any language that has a library that lets you communicate over a network. <a href="https://github.com/yhirose/cpp-httplib">Even C++!</a> But usually not C++.</li>
                    <li>You don't need backend code if you just stick frontend code in HTML files and open them with your web browser, but that does make it pretty much impossible to do things like persist data or communicate with an API over the Internet.</li>
                    <li>Frontend code must be written in HTML, CSS, and JavaScript because those are the languages web browsers understand.
                        <ul>
                            <li style="font-size: 90%">Unless you're using a language that can be transformed into one of those languages, like TypeScript.</li>
                            <li style="font-size: 80%">Or you're compiling code from other languages into WebAssembly. Look, I might be getting too detail-oriented here.</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="my-6">
                <h3 class="text-2xl font-bold mb-2">APIs</h3>
                <img src="/technology_guide/api.jpg" alt="API illustration" class="mx-auto my-4" style="max-width: 270px; width: 100%;" />
                <p>API stands for Application Programming Interface and it is a very broad term that can refer to any agreed-upon system for enabling two computer programs or libraries to interact in a constructive way.</p>
                <p>A lot of the time, though, an API is going to turn out to be a service that provides structured data over the Internet. A classic example is the <a href="https://openweathermap.org/api">OpenWeather API</a>. You can create an API call, which in this case requires you to identify yourself using a unique API key that you got by making an account with the service, and your program will get back data in some specified format like JSON or XML that informs it what the weather is, was, or is predicted to be in a certain area. It will handle a certain amount of requests for free, and then expect you to pay up for more. You can create a program that uses that data to do things like critique picnicking schedules.</p>
                <p>This is essentially a backend web server (see the section above) that responds to network requests with raw data, instead of with client-side code that creates a graphical user interface. It is often useful to use an API to interact with fancy tools that you can't build yourself, like large language models (see the section below.)</p>
                <p>Often, libraries exist that provide pre-programmed ways to request data from any given API, like <a href="https://github.com/csparpa/pyowm">this</a> Python library that lets you get weather data with simple function calls. Keep an eye out for libraries like this, because they can be helpful.</p>
                <p><a href="https://github.com/public-api-lists/public-api-lists">Here is a big list I found that encompasses many web APIs.</a></p>
            </div>
            <div class="my-6">
                <h3 class="text-2xl font-bold mb-2">Artificial Intelligence</h3>
                <img src="/technology_guide/ai.jpg" alt="AI illustration" class="mx-auto my-4" style="max-width: 270px; width: 100%;" />
                <p>This term typically refers to technology that can make sense out of the ambiguities involved in natural phenomena like language or images in a probabilistic way.</p>
                <h4 class="font-bold mt-4">Using existing tools via APIs</h4>
                <ul class="list-disc ml-6">
                    <li>As covered in the section above, APIs let you request data from other people's computers and use it in your own endeavors. The <a href="https://platform.openai.com/docs/introduction">OpenAI API</a>, which you can use to get freshly generated text or images or transcribed audio or various other things, is the basis of tons of products and projects. However, as such, it's not free.
                        <ul>
                            <li>If you haven't opened an OpenAI account before, you are granted $5 of free credit for signing up, which expires after three months; $5 doesn't sound like a lot, but if you look at <a href="https://openai.com/pricing">OpenAI's pricing</a>, it can go a fairly long way.</li>
                        </ul>
                    </li>
                    <li>Google offers a lot more free credit for its <a href="https://cloud.google.com/use-cases/free-ai-tools">AI tools</a>, including <a href="https://ai.google.dev/pricing">Gemini</a>, its large language model. You can use Gemini 1.0 Pro for free at a maximum rate of 15 requests per minute - that won't let you deploy a product to hundreds of thousands of users, but it can be useful for a hackathon project here and there.</li>
                    <li>Cohere, which has recently released a new large language model called Command R+ that has climbed the ranks on the Chatbot Arena Leaderboard, also <a href="https://cohere.com/pricing">offers free trial access to their API</a>.</li>
                </ul>
                <h4 class="font-bold mt-4">Using existing tools through libraries</h4>
                <ul class="list-disc ml-6">
                    <li>There are also many options for those ambitious enough to want to install a mechanical soul into their own actual computer. <a href="https://github.com/ggerganov/llama.cpp">llama.cpp</a> is a library that lets you run a variety of large language models locally for text completion and chat, although you'll be expected to have pretty decent specs to run the high-end ones.</li>
                    <li><a href="https://huggingface.co">Hugging Face</a> provides a vast array of models for different use cases that involve handling text, images, and audio, most of which can be downloaded and utilised in a few lines of code using their <a href="https://github.com/huggingface/transformers">transformers</a> Python library. Again, you might have to be a little bit patient to get results on an ordinary computer, but it is more exciting to see things like speech recognition happen right there in front of you.</li>
                    <li>Also, there exist higher-level libraries that can make use of local and non-local machine learning models, like <a href="https://www.ibm.com/topics/langchain">LangChain</a>, which is a popular framework for building applications around large language models using techniques like retrieval-augmented generation (RAG), where the AI is given the ability to skim through text that you provide to identify relevant information and answer your questions. (Basically.)</li>
                </ul>
                <h4 class="font-bold mt-4">Training brand new models</h4>
                <p>Although getting new machine learning models working takes quite a bit of ambition and patience, it is interesting to see how computers can turn data into the appearance of intelligence, and there are two whole extremely popular Python libraries to do it with.</p>
                <ul class="list-disc ml-6">
                    <li><a href="https://github.com/tensorflow/tensorflow">TensorFlow</a> has more stars on Github so I'm putting it first. It is a machine learning library created by Google and later integrated with another library called Keras that provides a high-level interface to the problem of turning e.g. a gigantic number of pictures of birds into a machine learning model that can recognize species of bird. It also provides access to <a href="https://www.tensorflow.org/hub">TensorFlow Hub</a>, which provides many models pre-trained for things like image recognition, which can be customized to recognize specific kinds of images, like those of birds.</li>
                    <li><a href="https://github.com/pytorch/pytorch">PyTorch</a> is used more by academics and is also perfectly capable of being used to create a bird recognizer. Although it seems to me like a lot of generalist usage of these libraries is centered around recognizing pictures of things, <a href="https://www.youtube.com/watch?v=kCc8FmEb1nY">here</a> is a YouTube video where a former OpenAI engineer uses PyTorch to build a GPT-style LLM, which is something.</li>
                </ul>
                <p>Note that <a href="https://colab.research.google.com/">Google Colab</a> and <a href="https://www.kaggle.com/">Kaggle</a> both provide <a href="https://jupyter.org/">Jupyter Notebook</a>-based Python environments that are commonly used to test out AI projects.</p>
            </div>
            <div class="my-6">
                <h3 class="text-2xl font-bold mb-2">Apps!</h3>
                <img src="/technology_guide/app.png" alt="App illustration" class="mx-auto my-4" style="max-width: 330px; width: 100%;" />
                <p>Native, installable apps can benefit in speed, look, and feel from being built to run on a specific kind of device. There are usually relatively straightforward recommended ways to build apps for a specific platform; there aren't a huge number of different ideas for how to deploy things crowding into the field. How you create your app depends largely on where you want it to run, so let's go through the possibilities:</p>
                <h4 class="font-bold mt-4">Windows</h4>
                <p>If you want to create an app for Windows, you should probably use the Windows Presentation Foundation (WPF) framework. It lets you create apps using XAML, which is like HTML but for Windows, and C#. The simplest way to use WPF is to create a new project with it in <a href="https://visualstudio.microsoft.com/vs/">Microsoft Visual Studio</a>.</p>
                <h4 class="font-bold mt-4">MacOS/iOS</h4>
                <p>Apple's devices currently use the <a href="https://developer.apple.com/xcode/swiftui/">SwiftUI</a> framework for creating apps, which is built around the new-ish programming language called Swift.</p>
                <h4 class="font-bold mt-4">Android</h4>
                <p>Android apps are currently usually built in <a href="https://developer.android.com/studio">Android Studio</a> using a new-ish programming language called Kotlin.</p>
                <h4 class="font-bold mt-4">Cross-Platform for Desktop</h4>
                <p><a href="https://www.qt.io/">Qt</a> is a C++ library that is mostly used to make desktop apps for MacOS, Linux, and Windows by projects ranging from Maya to VLC Player. It also has a Python version.</p>
                <h4 class="font-bold mt-4">Cross-Platform for Mobile</h4>
                <p>Guess what, React Native is a popular way to create apps for phones that are not on the web but somehow still use JavaScript. God why.</p>
                <h4 class="font-bold mt-4">Cross-platform in General</h4>
                <p><a href="https://flutter.dev/">Flutter</a> is a new-ish framework created by Google that I've seen work well on desktop and on mobile.</p>
            </div>
            <h2 class="text-2xl font-bold mt-8">But:</h2>
            <p>Don't let this list of technologies hold you back!</p>
            <p>
                The above is meant to be a survey of the most common ways to accomplish different tasks, not an exhaustive list of interesting bases for projects. You can ignore all of the above and build a GUI in <a href="https://ziglang.org/" class="text-blue-600 underline">Zig</a> or a command line app in Lisp, as long as it does something interesting and you learn something while doing it.
            </p>
            <p class="text-sm mt-4">
                This content is released under the terms of <a href="https://creativecommons.org/licenses/by/4.0/" class="text-blue-600 underline">CC-BY 4.0</a>.
            </p>
        </div>
    </Card>
</div>
