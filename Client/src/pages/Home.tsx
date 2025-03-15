import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkcookie } from "../Api/useAuth";

const Home = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const Navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkuser = async () => {
            const res = await checkcookie();
            if (res.message === 'Protected content') {
                Navigate(`/dashboard/${res.username}`)
            }
        }
        checkuser()
    }, [])

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } }
    };

    const slideUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="landing-page min-h-screen bg-purple-100 text-gray-800">
            <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-purple-900 shadow-lg py-2'
                : 'bg-transparent py-4'
                }`}>
                <div className="container mx-auto flex items-center justify-between px-6 md:px-12 lg:px-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <motion.button
                            onClick={scrollToTop}
                            className="flex items-center gap-2 focus:outline-none"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <motion.img
                                className="w-14"
                                src="/logo.webp"
                                alt="logo"
                                whileHover={{ rotate: 10, transition: { duration: 0.3 } }}
                            />
                            <h1 className="text-xl font-bold text-white">
                                ChatThisWay
                            </h1>
                        </motion.button>
                    </motion.div>
                    <nav className="hidden md:block">
                        <motion.ul
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="flex gap-8 items-center"
                        >
                            <motion.li variants={slideUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                                <a href="#features" className="font-medium text-white hover:text-purple-200 transition-colors">
                                    Features
                                </a>
                            </motion.li>
                            <motion.li variants={slideUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                                <a href="#about" className="font-medium text-white hover:text-purple-200 transition-colors">
                                    About
                                </a>
                            </motion.li>
                            <motion.li variants={slideUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="font-medium text-white hover:text-purple-200 transition-colors"
                                >
                                    Login
                                </button>
                            </motion.li>
                            <motion.li variants={slideUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="bg-white text-purple-900 px-5 py-2 rounded-full font-medium hover:bg-purple-100 hover:shadow-lg transition-all duration-300"
                                >
                                    Sign Up
                                </button>
                            </motion.li>
                        </motion.ul>
                    </nav>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="md:hidden text-white focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isMobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden bg-purple-900 border-t border-purple-800 shadow-lg"
                        >
                            <div className="container mx-auto px-4 py-3">
                                <motion.ul
                                    className="space-y-3 py-2"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.li variants={slideUp}>
                                        <a
                                            href="#features"
                                            className="block text-white hover:text-purple-200 font-medium transition-colors py-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Features
                                        </a>
                                    </motion.li>
                                    <motion.li variants={slideUp}>
                                        <a
                                            href="#about"
                                            className="block text-white hover:text-purple-200 font-medium transition-colors py-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            About
                                        </a>
                                    </motion.li>
                                    <motion.li variants={slideUp}>
                                        <button
                                            onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left text-white hover:text-purple-200 font-medium transition-colors py-2"
                                        >
                                            Login
                                        </button>
                                    </motion.li>
                                    <motion.li variants={slideUp} className="pt-2">
                                        <button
                                            onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }}
                                            className="block w-full bg-white text-purple-900 px-5 py-3 rounded-full font-medium text-center hover:bg-purple-100 hover:shadow-lg transition-all"
                                        >
                                            Sign Up
                                        </button>
                                    </motion.li>
                                </motion.ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <section className="pt-28 pb-20 md:pt-36 md:pb-32 relative overflow-hidden bg-gradient-to-b from-purple-900 to-purple-700 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-10 -left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 8,
                            ease: "easeInOut"
                        }}
                    ></motion.div>
                    <motion.div
                        className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.25, 0.2]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 10,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    ></motion.div>
                    <motion.div
                        className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10"
                        animate={{
                            scale: [1, 1.15, 1],
                            x: [0, 10, 0],
                            opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    ></motion.div>
                </div>

                <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.span
                                variants={slideUp}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-200 text-purple-900 mb-6"
                            >
                                <span className="w-2 h-2 rounded-full bg-purple-900 mr-2 animate-pulse"></span>
                                Next-Gen Messaging Platform
                            </motion.span>

                            <motion.h1
                                variants={slideInLeft}
                                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                            >
                                Connect and Chat{' '}
                                <motion.span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200"
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    Like Never Before
                                </motion.span>
                            </motion.h1>

                            <motion.p
                                variants={fadeIn}
                                className="text-lg sm:text-xl text-purple-100 mb-10 max-w-lg mx-auto lg:mx-0"
                            >
                                Experience seamless communication with our modern messaging platform. Connect with friends, family, and colleagues instantly and securely.
                            </motion.p>

                            <motion.div
                                variants={staggerContainer}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <motion.button
                                    variants={slideUp}
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/signup")}
                                    className="bg-white text-purple-900 px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg"
                                >
                                    Get Started
                                </motion.button>
                                <motion.a
                                    href="#about"
                                    variants={slideUp}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="border-2 border-white text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center"
                                >
                                    Learn More
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </motion.a>
                            </motion.div>

                        </motion.div>

                        <motion.div
                            className="lg:w-1/2"
                            variants={slideInRight}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-xl p-2 sm:p-4 relative"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                whileHover={{
                                    scale: 1.02,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <img
                                    src="/banner.png"
                                    alt="Chat Interface"
                                    className="w-full rounded-xl"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://via.placeholder.com/600x400?text=ChatThisWay+Interface";
                                    }}
                                />
                                <motion.div
                                    className="absolute -bottom-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                                >
                                    <span className="text-xl font-bold">New</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
                        <path fill="#f3e8ff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,181.3C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            <section id="features" className="py-28 bg-purple-50">
                <div className="container mx-auto px-6 md:px-12 lg:px-16">
                    <motion.div
                        className="text-center mb-20"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={scaleIn} className="inline-block px-3 py-1.5 rounded-full bg-purple-200 text-purple-800 text-sm font-medium mb-4">
                            Features
                        </motion.div>
                        <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold mb-4 text-purple-900">
                            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">ChatThisWay</span>?
                        </motion.h2>
                        <motion.p variants={slideUp} className="text-xl text-purple-800 max-w-2xl mx-auto">
                            We've built a messaging platform that combines security, speed, and simplicity in one elegant package.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                    >
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                ),
                                title: "Secure Messaging",
                                description: "End-to-end encryption ensures your conversations stay private and secure.",
                                color: "bg-purple-200 text-purple-800"
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                ),
                                title: "Real-Time Chat",
                                description: "Instant messaging without delays or refreshing. Stay connected in real-time.",
                                color: "bg-purple-200 text-purple-800"
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: "Modern UI/UX",
                                description: "Intuitive design with smooth animations for a delightful user experience.",
                                color: "bg-purple-200 text-purple-800"
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                                variants={scaleIn}
                                whileHover={{
                                    y: -8,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.div
                                    className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}
                                    whileHover={{ rotate: 5, scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold mb-3 text-purple-900">{feature.title}</h3>
                                <p className="text-purple-700">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section id="about" className="py-28 bg-purple-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                </div>

                <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
                    <motion.div
                        className="text-center mb-20"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={slideUp} className="inline-block px-3 py-1.5 rounded-full bg-purple-200 text-purple-800 text-sm font-medium mb-4">
                            About This Project
                        </motion.div>
                        <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold mb-6">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">Story</span> Behind ChatThisWay
                        </motion.h2>
                        <motion.p variants={slideUp} className="text-xl text-purple-100 max-w-3xl mx-auto">
                            A passion project built to explore modern web technologies and create meaningful connections.
                        </motion.p>
                    </motion.div>

                    <div className="flex flex-col gap-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="order-2 lg:order-1"
                            >
                                <div className="bg-purple-700/30 p-8 rounded-2xl backdrop-blur-sm">
                                    <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                                        Why I Built This
                                    </h3>
                                    <p className="text-purple-100 mb-6 leading-relaxed">
                                        ChatThisWay started as a personal project to learn more about real-time communication technologies
                                        and modern full-stack development. I wanted to create something that was both functional and visually appealing.
                                    </p>

                                    <p className="text-purple-100 mb-6 leading-relaxed">
                                        As someone who uses messaging apps daily, I was curious about how they worked behind the scenes.
                                        This curiosity led me down the path of building my own messaging platform from scratch.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="order-1 lg:order-2"
                            >
                                <div className="bg-white p-2 rounded-xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                                    <div className="bg-purple-100 rounded-lg p-6 relative">
                                        <div className="flex items-center mb-6">
                                            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="text-purple-900 font-mono text-sm">
                                            <p className="mb-1"><span className="text-purple-600">const</span> <span className="text-pink-600">chatApp</span> = {`{`}</p>
                                            <p className="mb-1 pl-4"><span className="text-purple-600">name</span>: <span className="text-green-600">'ChatThisWay'</span>,</p>
                                            <p className="mb-1 pl-4"><span className="text-purple-600">creator</span>: <span className="text-green-600">'Het Chawda'</span>,</p>
                                            <p className="mb-1 pl-4"><span className="text-purple-600">status</span>: <span className="text-green-600">'Always Improving'</span>,</p>
                                            <p className="mb-1 pl-4"><span className="text-purple-600">goal</span>: <span className="text-green-600">'Learn & Build Something Awesome'</span></p>
                                            <p>{`}`};</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={staggerContainer}
                            className="max-w-4xl mx-auto"
                        >
                            <motion.h3 
                                variants={slideUp} 
                                className="text-2xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200"
                            >
                                Built With Modern Tech Stack
                            </motion.h3>

                            <motion.div 
                                variants={staggerContainer}
                                className="grid grid-cols-2 md:grid-cols-4 gap-6"
                            >
                                {[
                                    {
                                        title: "Frontend",
                                        tech: "React, TypeScript, Tailwind CSS, Framer Motion",
                                        icon: "💻"
                                    },
                                    {
                                        title: "Backend",
                                        tech: "Node.js, Express, Socket.io, MongoDB",
                                        icon: "🖧"
                                    },
                                    {
                                        title: "Features",
                                        tech: "Real-time messaging, user authentication, message history",
                                        icon: "✨"
                                    },
                                    {
                                        title: "Learning Goals",
                                        tech: "WebSockets, state management, responsive design",
                                        icon: "🎯"
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        variants={scaleIn}
                                        whileHover={{ 
                                            y: -8,
                                            backgroundColor: "rgba(139, 92, 246, 0.6)",
                                            transition: { duration: 0.2 }
                                        }}
                                        className="bg-purple-700/30 backdrop-blur-sm p-6 rounded-xl border border-purple-600/30 shadow-lg hover:shadow-purple-500/20"
                                    >
                                        <div className="text-3xl mb-4">{item.icon}</div>
                                        <h4 className="font-bold mb-3 text-lg">{item.title}</h4>
                                        <p className="text-purple-100 text-sm leading-relaxed">{item.tech}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="mt-8"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={staggerContainer}
                        >
                            <motion.h3 variants={slideUp} className="text-2xl font-bold mb-12 text-center">
                                The Journey So Far
                            </motion.h3>

                            <motion.div
                                variants={fadeIn}
                                className="flex flex-col lg:flex-row gap-8"
                            >
                                {[
                                    {
                                        step: "01",
                                        title: "Learning",
                                        description: "Started by researching messaging architectures and real-time communication"
                                    },
                                    {
                                        step: "02",
                                        title: "Building",
                                        description: "Developed the core functionality with React and Node.js"
                                    },
                                    {
                                        step: "03",
                                        title: "Improving",
                                        description: "Refining the UI/UX and adding new features based on feedback"
                                    },
                                    {
                                        step: "04",
                                        title: "Sharing",
                                        description: "Open to collaboration and excited to hear what you think!"
                                    }
                                ].map((step, index) => (
                                    <motion.div
                                        key={index}
                                        variants={slideUp}
                                        className="relative bg-purple-700/30 p-6 rounded-xl flex-1 backdrop-blur-sm border-l-4 border-purple-500"
                                        whileHover={{
                                            y: -5,
                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="absolute -left-4 -top-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{step.step}</div>
                                        <h4 className="text-xl font-bold mb-3 mt-3">{step.title}</h4>
                                        <p className="text-purple-100">{step.description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full overflow-hidden pt-16">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
                        <path fill="#f3e8ff" fillOpacity="1" d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,192C672,192,768,224,864,240C960,256,1056,256,1152,234.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            <section className="py-28 bg-purple-50">
                <motion.div
                    className="container mx-auto px-6 md:px-12 lg:px-16 text-center max-w-4xl"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={staggerContainer}
                >
                    <motion.h2
                        variants={slideUp}
                        className="text-3xl font-bold mb-4 text-purple-900"
                    >
                        Ready to start chatting?
                    </motion.h2>
                    <motion.p
                        variants={slideUp}
                        className="text-xl mb-10 max-w-2xl mx-auto text-purple-700"
                    >
                        Experience ChatThisWay today and see what the future of messaging could be.
                    </motion.p>
                    <motion.div variants={scaleIn}>
                        <motion.button
                            onClick={() => navigate("/signup")}
                            className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-10 py-4 rounded-full font-medium transition-all shadow-lg"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Sign Up Now - It's Free
                        </motion.button>
                    </motion.div>
                    <motion.div
                        variants={fadeIn}
                        className="mt-8 text-sm text-purple-600"
                    >
                        No credit card required • Cancel anytime
                    </motion.div>
                </motion.div>
            </section>
            <footer className="bg-purple-900 text-white py-8">
                <motion.div
                    className="container mx-auto px-6 md:px-12 lg:px-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="text-center text-purple-200">
                        <p>&copy; {new Date().getFullYear()} ChatThisWay. All rights reserved.</p>
                    </div>
                </motion.div>
            </footer>
        </div>
    );
};

export default Home;