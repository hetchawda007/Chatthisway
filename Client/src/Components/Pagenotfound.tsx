import { motion } from "framer-motion";
import SEOHelmet from "./SEOHelmet";

const Pagenotfound = () => {
  return (
    <>
      <SEOHelmet
        title="404 - Page Not Found | ChatThisWay"
        description="The page you're looking for doesn't exist or has been moved."
        keywords="404, error, page not found, ChatThisWay"
        ogTitle="Page Not Found - ChatThisWay"
        ogDescription="Sorry, the page you were looking for could not be found."
      />

      <div>
        <h1>404 Page Not Found</h1>
      </div>
    </>
  )
}

export default Pagenotfound