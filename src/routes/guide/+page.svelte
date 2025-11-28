<script lang="ts">
    import Card from "../../components/Card.svelte";
    import Link from "../../components/Link.svelte";

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

<div class="py-12 px-4 md:px-12 lg:px-24 xl:px-36 flex flex-col gap-12 text-black guide-content text-left">
    <!-- Header Section -->
    <div class="text-center max-w-4xl mx-auto">
        <h1 class="font-bold text-5xl mb-6 text-secondary">A Quickstart Guide to Hackathons</h1>
        <p class="text-xl mb-4 leading-relaxed">
            Throwing together a revolutionary new product that <strong>shakes the world to its core</strong> and <strong><em>permanently changes humans' relationship with technology</em></strong> in less than 24 hours might sound hard, <strong>but it's really not.</strong>
        </p>
        <p class="text-lg">
            All you need is an idea and the tools to implement it. For example:
        </p>
    </div>

    <!-- Previous Projects Section -->
    <div>
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Previous Projects ~</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {#each projects as project}
                <Card padded>
                    <div class="flex flex-col h-full">
                        <img src={project.image} alt={project.title} class="w-full h-48 object-cover rounded-md mb-4" />
                        <h3 class="font-bold text-xl mb-2">{project.title}</h3>
                        <div class="mb-4 flex-grow">
                            {#each project.description as desc}
                                <p class="mb-2 text-sm opacity-90">{desc}</p>
                            {/each}
                        </div>
                        <div class="mt-auto">
                            <p class="text-xs font-mono mb-3 opacity-75">
                                <strong>Tech:</strong> {project.tech}
                            </p>
                            <Link href={project.link} target="_blank">View on Devpost</Link>
                        </div>
                    </div>
                </Card>
            {/each}
        </div>
        <p class="mt-8 text-center text-lg">
            <Link href="https://devpost.com/software" target="_blank">For even more projects, browse the global project gallery on Devpost.</Link>
        </p>
    </div>

    <!-- Key Takeaways -->
    <div class="max-w-4xl mx-auto w-full">
        <Card padded>
            <h3 class="text-2xl font-bold mb-4">Key takeaways for success:</h3>
            <ul class="list-disc ml-6 space-y-2">
                <li>Keep the scope of your project narrow - if you have an idea, try to just implement the core of it.</li>
                <li><strong>Put a little hot sauce on that bad boy.</strong></li>
                <li>Use libraries written in your chosen language that solve hard problems.</li>
                <li>Use a high-level framework that takes care of the routine details of the kind of project you're working on.</li>
            </ul>
            <p class="mt-4">For more on those last two points, read on:</p>
        </Card>
    </div>

    <!-- Technologies Section -->
    <div>
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">Technologies</h2>
        
        <div class="flex flex-col gap-8">
            <!-- Web Development -->
            <Card padded>
                <h3 class="text-2xl font-bold mb-4">Web Development</h3>
                <p class="mb-4">This is the most common way to create apps, using centralized data and computation and convenient graphical user interfaces.</p>
                <img src="/technology_guide/www.gif" alt="A retro animated spinning globe." class="mx-auto my-6 rounded-md" style="max-width: 270px; width: 100%;" />
                <p class="mb-4">The web technologies that were originally developed for the creation of Geocities pages and mailing list address forms eventually broke containment and infiltrated every single facet of the modern graphical user interface-based world.</p>
                <p class="mb-4">Generally, to use them, you need to create a <strong>backend server application</strong> that can store data, make itself available on a network, and usually do most of the actual work that the thing you're making needs to do. When a web browser (aka a <strong>client</strong>) connects to it, the backend server will send <strong>client-side code</strong> to the browser that will tell the browser what to display to the user. The server application is known as the <strong>backend</strong>; the client-side code is called the <strong>frontend</strong>.</p>
                
                <p class="mb-2 font-semibold">Popular backend/frontend combos:</p>
                <div class="overflow-x-auto my-4 rounded-lg border border-white/20">
                    <table class="min-w-full text-left text-sm">
                        <thead class="bg-black/20 text-white">
                            <tr>
                                <th class="px-4 py-3 font-bold">Backend</th>
                                <th class="px-4 py-3 font-bold">Frontend</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/10">
                            <tr>
                                <td class="px-4 py-3">None</td>
                                <td class="px-4 py-3"><Link href="https://developer.mozilla.org/en-US/docs/Learn/HTML" target="_blank">HTML files</Link></td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3"><Link href="https://flask.palletsprojects.com/en/3.0.x/" target="_blank">Flask</Link> (Python library)</td>
                                <td class="px-4 py-3"><Link href="https://jinja.palletsprojects.com/en/3.1.x/" target="_blank">Jinja HTML templates</Link></td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3"><Link href="https://expressjs.com" target="_blank">Express.js</Link> (JavaScript library)</td>
                                <td class="px-4 py-3">Interactive components using <Link href="https://vuejs.org/" target="_blank">Vue</Link> & <Link href="https://vitejs.dev/" target="_blank">Vite</Link></td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3" colspan="2"><Link href="https://nextjs.org/" target="_blank">Next.js</Link> (JavaScript backend + <Link href="https://react.dev/" target="_blank">React</Link> frontend components.)</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3">Serverless Functions (<Link href="https://vercel.com/" target="_blank">Vercel</Link>/<Link href="https://www.netlify.com/" target="_blank">Netlify</Link>)</td>
                                <td class="px-4 py-3">Static site generation with <Link href="https://astro.build/" target="_blank">Astro</Link> (The <Link href="https://jamstack.org/" target="_blank">Jamstack</Link>)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="space-y-2 mt-4">
                    <p><strong><Link href="https://flask.palletsprojects.com/en/3.0.x/" target="_blank">Flask with Jinja templates</Link></strong> is popular and highly recommended for fairly straightforward static websites.</p>
                    <p><strong><Link href="https://nextjs.org/" target="_blank">Next.js</Link></strong> is popular and highly recommended for somewhat more polished and complex user interfaces.</p>
                </div>

                <h4 class="text-lg font-bold mt-6 mb-2">Follow-up points:</h4>
                <ul class="list-disc ml-6 space-y-1 text-sm opacity-90">
                    <li>Yes, there are several zillion web development frameworks. We'll come up with one that leaves your sanity intact eventually.</li>
                    <li>Note that you need to download <Link href="https://nodejs.org/en" target="_blank">Node.js</Link> to run JavaScript outside of the browser just like you need to download <Link href="https://www.python.org/downloads/" target="_blank">Python</Link> to run Python.</li>
                    <li>Backend code can be written in any language that has a library that lets you communicate over a network. <Link href="https://github.com/yhirose/cpp-httplib" target="_blank">Even C++!</Link> But usually not C++.</li>
                    <li>You don't need backend code if you just stick frontend code in HTML files and open them with your web browser, but that does make it pretty much impossible to do things like persist data or communicate with an API over the Internet.</li>
                    <li>Frontend code must be written in HTML, CSS, and JavaScript because those are the languages web browsers understand.</li>
                </ul>
            </Card>

            <!-- APIs -->
            <Card padded>
                <h3 class="text-2xl font-bold mb-4">APIs</h3>
                <img src="/technology_guide/api.jpg" alt="API illustration" class="mx-auto my-6 rounded-md" style="max-width: 270px; width: 100%;" />
                <p class="mb-4">API stands for Application Programming Interface and it is a very broad term that can refer to any agreed-upon system for enabling two computer programs or libraries to interact in a constructive way.</p>
                <p class="mb-4">A lot of the time, though, an API is going to turn out to be a service that provides structured data over the Internet. A classic example is the <Link href="https://openweathermap.org/api" target="_blank">OpenWeather API</Link>. You can create an API call, which in this case requires you to identify yourself using a unique API key that you got by making an account with the service, and your program will get back data in some specified format like JSON or XML that informs it what the weather is, was, or is predicted to be in a certain area.</p>
                <p class="mb-4">This is essentially a backend web server that responds to network requests with raw data, instead of with client-side code that creates a graphical user interface.</p>
                <p class="mb-4">Often, libraries exist that provide pre-programmed ways to request data from any given API, like <Link href="https://github.com/csparpa/pyowm" target="_blank">this</Link> Python library that lets you get weather data with simple function calls.</p>
                <p><Link href="https://github.com/public-api-lists/public-api-lists" target="_blank">Here is a big list I found that encompasses many web APIs.</Link></p>
            </Card>

            <!-- AI -->
            <Card padded>
                <h3 class="text-2xl font-bold mb-4">Artificial Intelligence</h3>
                <img src="/technology_guide/ai.jpg" alt="AI illustration" class="mx-auto my-6 rounded-md" style="max-width: 270px; width: 100%;" />
                <p class="mb-4">This term typically refers to technology that can make sense out of the ambiguities involved in natural phenomena like language or images in a probabilistic way.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h4 class="font-bold text-lg mb-2">Using existing tools via APIs</h4>
                        <ul class="list-disc ml-6 space-y-2 text-sm opacity-90">
                            <li><Link href="https://platform.openai.com/docs/introduction" target="_blank">OpenAI API</Link>: Text, images, audio. $5 free credit on sign-up.</li>
                            <li><Link href="https://cloud.google.com/use-cases/free-ai-tools" target="_blank">Google AI Tools</Link>: Gemini 1.0 Pro is free (15 req/min).</li>
                            <li><Link href="https://cohere.com/pricing" target="_blank">Cohere</Link>: Free trial access to their API.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg mb-2">Using existing tools through libraries</h4>
                        <ul class="list-disc ml-6 space-y-2 text-sm opacity-90">
                            <li><Link href="https://github.com/ggerganov/llama.cpp" target="_blank">llama.cpp</Link>: Run LLMs locally.</li>
                            <li><Link href="https://huggingface.co" target="_blank">Hugging Face</Link>: Vast array of models using the <Link href="https://github.com/huggingface/transformers" target="_blank">transformers</Link> library.</li>
                            <li><Link href="https://www.ibm.com/topics/langchain" target="_blank">LangChain</Link>: Framework for building LLM apps.</li>
                        </ul>
                    </div>
                </div>

                <h4 class="font-bold text-lg mt-6 mb-2">Training brand new models</h4>
                <p class="mb-4 text-sm opacity-90">Although getting new machine learning models working takes quite a bit of ambition and patience, it is interesting to see how computers can turn data into the appearance of intelligence.</p>
                <ul class="list-disc ml-6 space-y-2 text-sm opacity-90">
                    <li><Link href="https://github.com/tensorflow/tensorflow" target="_blank">TensorFlow</Link>: Google's ML library.</li>
                    <li><Link href="https://github.com/pytorch/pytorch" target="_blank">PyTorch</Link>: Popular in academia and industry.</li>
                </ul>
                <p class="mt-4 text-sm">Note that <Link href="https://colab.research.google.com/" target="_blank">Google Colab</Link> and <Link href="https://www.kaggle.com/" target="_blank">Kaggle</Link> both provide <Link href="https://jupyter.org/" target="_blank">Jupyter Notebook</Link>-based Python environments.</p>
            </Card>

            <!-- Apps -->
            <Card padded>
                <h3 class="text-2xl font-bold mb-4">Apps!</h3>
                <img src="/technology_guide/app.png" alt="App illustration" class="mx-auto my-6" style="max-width: 330px; width: 100%;" />
                <p class="mb-6">Native, installable apps can benefit in speed, look, and feel from being built to run on a specific kind of device.</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <h4 class="font-bold mb-1">Windows</h4>
                        <p class="text-sm opacity-90">WPF (C# & XAML) in <Link href="https://visualstudio.microsoft.com/vs/" target="_blank">Visual Studio</Link>.</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-1">MacOS/iOS</h4>
                        <p class="text-sm opacity-90"><Link href="https://developer.apple.com/xcode/swiftui/" target="_blank">SwiftUI</Link> (Swift).</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-1">Android</h4>
                        <p class="text-sm opacity-90"><Link href="https://developer.android.com/studio" target="_blank">Android Studio</Link> (Kotlin).</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-1">Desktop Cross-Platform</h4>
                        <p class="text-sm opacity-90"><Link href="https://www.qt.io/" target="_blank">Qt</Link> (C++ or Python).</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-1">Mobile Cross-Platform</h4>
                        <p class="text-sm opacity-90">React Native or <Link href="https://flutter.dev/" target="_blank">Flutter</Link>.</p>
                    </div>
                </div>
            </Card>
        </div>

        <div class="mt-12 text-center max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-4 text-secondary">But:</h2>
            <p class="text-lg mb-4">Don't let this list of technologies hold you back!</p>
            <p class="mb-4">
                The above is meant to be a survey of the most common ways to accomplish different tasks, not an exhaustive list of interesting bases for projects. You can ignore all of the above and build a GUI in <Link href="https://ziglang.org/" target="_blank">Zig</Link> or a command line app in Lisp, as long as it does something interesting and you learn something while doing it.
            </p>
            <p class="text-sm opacity-75">
                This content is released under the terms of <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY 4.0</Link>.
            </p>
        </div>
    </div>
</div>
