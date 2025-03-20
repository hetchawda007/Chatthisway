import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SEOHelmet from "./SEOHelmet";

const Pagenotfound = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <SEOHelmet
        title="404 - Page Not Found | ChatThisWay"
        description="The page you're looking for doesn't exist or has been moved."
        keywords="404, error, page not found, ChatThisWay"
        ogTitle="Page Not Found - ChatThisWay"
        ogDescription="Sorry, the page you were looking for could not be found."
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#16162a] via-[#1e1e2d] to-[#252536]">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full opacity-20 filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600 rounded-full opacity-20 filter blur-3xl"></div>
        </div>

        <motion.div 
          className="container relative z-10 px-6 py-16 mx-auto text-center max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <span className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">404</span>
          </motion.div>
          
          <motion.h1 
            className="mb-6 text-3xl font-bold text-white"
            variants={itemVariants}
          >
            Page Not Found
          </motion.h1>
          
          <motion.p 
            className="mb-8 text-lg text-indigo-200"
            variants={itemVariants}
          >
            Sorry, the page you are looking for doesn't exist or has been moved.
          </motion.p>
          
          <motion.div 
            className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate("/")}
              className="px-8 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/20"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Go Home
            </motion.button>
            
            <motion.button
              onClick={() => navigate(-1)}
              className="px-8 py-3 text-white bg-transparent border-2 border-white/30 hover:border-white/60 rounded-full font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Back
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16"
          >
            <motion.div 
              className="inline-block"
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
            >
              <svg className="w-24 h-24 mx-auto text-indigo-500 opacity-50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.9 19.2L10.5 15L8.1 11.4L12.3 10.8L14.1 7.2L15.9 10.8L20.1 11.4L17.7 15L18.3 19.2L14.1 17.1L9.9 19.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3.9 13.2L4.2 10.8L2.7 9L5.1 8.7L6 6.6L6.9 8.7L9.3 9L7.8 10.8L8.1 13.2L6 12L3.9 13.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Pagenotfound;
